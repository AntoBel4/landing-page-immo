/**
 * setup_gsheet_headers.mjs
 * Data Master — Task Force RentrerDesMandats
 *
 * Configure les en-têtes des onglets 'Prospects' et 'Chasse'
 * dans le Google Sheet de production.
 *
 * Usage : node scripts/setup_gsheet_headers.mjs
 */

import http from 'http';
import { createServer } from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1LSPws9XrEYqPJ6vPg9atTu5YwAEbvoTb8SLMq3UJiyw';

// Définir ces variables dans votre environnement ou dans un fichier .env (jamais committer)
// GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET depuis Google Cloud Console > OAuth 2.0
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET requis.\n   Exécutez : GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/setup_gsheet_headers.mjs');
  process.exit(1);
}
const REDIRECT_PORT = 3000;
const REDIRECT_URI  = `http://localhost:${REDIRECT_PORT}`;
const TOKEN_FILE    = path.join(os.tmpdir(), 'rdm_gsheets_token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// ─── EN-TÊTES PAR ONGLET ────────────────────────────────────────────────────

const TABS = {
  Prospects: [
    'Email',
    'Source',
    'Date_Inscription',
    'Statut',
    'Tags',
    'Consent_Version',
    'UTM_Source',
    'UTM_Medium',
    'UTM_Campaign',
    'Date_Achat',
    'Montant',
    'Payment_ID',
    'Notes',
  ],
  Chasse: [
    'Prénom',
    'Nom',
    'Email',
    'Téléphone',
    'Réseau',
    'Ville',
    'Département',
    'Code Postal',
    'Note Google',
    'Nb Avis',
    'Site Web',
    'Score',
    'Niveau',
    'URL Google',
    'Date Scraping',
    'Statut',
    'Date_Contact',
  ],
};

// ─── OAUTH2 ──────────────────────────────────────────────────────────────────

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         SCOPES.join(' '),
    access_type:   'offline',
    prompt:        'consent',
  });
  return `https://accounts.google.com/o/oauth2/auth?${params}`;
}

async function exchangeCodeForToken(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return res.json();
}

function loadCachedToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    }
  } catch {}
  return null;
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
}

async function getAccessToken() {
  let cached = loadCachedToken();

  if (cached?.access_token) {
    // Vérifie si le token expire dans moins de 60s
    const expiresAt = cached.expires_at || 0;
    if (Date.now() < expiresAt - 60_000) {
      console.log('✅ Token en cache valide.');
      return cached.access_token;
    }
    if (cached.refresh_token) {
      console.log('🔄 Rafraîchissement du token...');
      const refreshed = await refreshAccessToken(cached.refresh_token);
      cached = {
        ...cached,
        access_token: refreshed.access_token,
        expires_at: Date.now() + (refreshed.expires_in || 3600) * 1000,
      };
      saveToken(cached);
      return cached.access_token;
    }
  }

  // Flow OAuth2 interactif
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`<h1>Erreur : ${error}</h1>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code) {
        res.end('<h1>En attente du code...</h1>');
        return;
      }

      res.end('<h1>✅ Authentification réussie ! Vous pouvez fermer cet onglet.</h1>');
      server.close();

      try {
        const token = await exchangeCodeForToken(code);
        const toSave = {
          access_token:  token.access_token,
          refresh_token: token.refresh_token,
          expires_at:    Date.now() + (token.expires_in || 3600) * 1000,
        };
        saveToken(toSave);
        console.log('✅ Token obtenu et sauvegardé.');
        resolve(token.access_token);
      } catch (err) {
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      const authUrl = buildAuthUrl();
      console.log('\n🔐 Autorisation Google requise.');
      console.log('   Ouverture du navigateur...\n');
      console.log(`   Si le navigateur ne s'ouvre pas, copiez ce lien :\n   ${authUrl}\n`);

      // Ouvre le navigateur selon l'OS
      const platform = process.platform;
      const cmd = platform === 'win32' ? `start "" "${authUrl}"`
                : platform === 'darwin' ? `open "${authUrl}"`
                : `xdg-open "${authUrl}"`;
      exec(cmd, (err) => {
        if (err) console.warn('⚠️  Impossible d\'ouvrir le navigateur automatiquement.');
      });
    });

    server.on('error', reject);
  });
}

// ─── ENABLE API ─────────────────────────────────────────────────────────────

async function enableSheetsAPI(accessToken) {
  console.log('⚙️  Activation de Google Sheets API sur le projet...');
  const res = await fetch(
    'https://serviceusage.googleapis.com/v1/projects/260043577239/services/sheets.googleapis.com:enable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    }
  );
  const data = await res.json();
  if (!res.ok) {
    // Déjà activée = pas une erreur bloquante
    if (data?.error?.message?.includes('already enabled') || res.status === 400) {
      console.log('   ℹ️  API déjà activée ou état en cours.');
    } else {
      throw new Error(`Enable API failed: ${JSON.stringify(data.error)}`);
    }
  } else {
    console.log('   ✅ Google Sheets API activée. Attente de propagation (15s)...');
    await new Promise(r => setTimeout(r, 15000));
  }
}

// ─── GOOGLE SHEETS API ───────────────────────────────────────────────────────

async function sheetsRequest(method, endpoint, accessToken, body = null) {
  const base = 'https://sheets.googleapis.com/v4/spreadsheets';
  const res = await fetch(`${base}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Sheets API error ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function ensureTabExists(spreadsheetId, tabName, accessToken) {
  const info = await sheetsRequest('GET', `/${spreadsheetId}?fields=sheets.properties`, accessToken);
  const exists = info.sheets.some(s => s.properties.title === tabName);
  if (!exists) {
    console.log(`   📋 Création de l'onglet "${tabName}"...`);
    await sheetsRequest('POST', `/${spreadsheetId}:batchUpdate`, accessToken, {
      requests: [{
        addSheet: {
          properties: { title: tabName },
        },
      }],
    });
    console.log(`   ✅ Onglet "${tabName}" créé.`);
  } else {
    console.log(`   ℹ️  Onglet "${tabName}" déjà existant.`);
  }
}

async function writeHeaders(spreadsheetId, tabName, headers, accessToken) {
  const range = `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`;
  await sheetsRequest(
    'PUT',
    `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    accessToken,
    {
      range,
      majorDimension: 'ROWS',
      values: [headers],
    }
  );
}

async function formatHeaderRow(spreadsheetId, sheetId, columnCount, accessToken) {
  await sheetsRequest('POST', `/${spreadsheetId}:batchUpdate`, accessToken, {
    requests: [
      // Gras
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnCount },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.6 },
            },
          },
          fields: 'userEnteredFormat(textFormat,backgroundColor)',
        },
      },
      // Figer la ligne 1
      {
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        },
      },
      // Auto-resize colonnes
      {
        autoResizeDimensions: {
          dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: columnCount },
        },
      },
    ],
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗂️  Data Master — Setup Google Sheet Headers');
  console.log(`   Spreadsheet : ${SPREADSHEET_ID}\n`);

  const accessToken = await getAccessToken();

  try { await enableSheetsAPI(accessToken); } catch (e) { console.log('   ⏭️  Activation API ignorée (scope insuffisant ou déjà active).'); }

  // Récupère les IDs des onglets
  const info = await sheetsRequest('GET', `/${SPREADSHEET_ID}?fields=sheets.properties`, accessToken);

  for (const [tabName, headers] of Object.entries(TABS)) {
    console.log(`\n📊 Onglet : "${tabName}"`);

    await ensureTabExists(SPREADSHEET_ID, tabName, accessToken);

    // Récupère l'ID de l'onglet (après création éventuelle)
    const updated = await sheetsRequest('GET', `/${SPREADSHEET_ID}?fields=sheets.properties`, accessToken);
    const sheet = updated.sheets.find(s => s.properties.title === tabName);
    const sheetId = sheet.properties.sheetId;

    // Vérifie si la ligne 1 est déjà remplie
    const existing = await sheetsRequest('GET', `/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName + '!A1:A1')}`, accessToken);
    if (existing.values?.length) {
      console.log(`   ⚠️  L'onglet "${tabName}" a déjà du contenu en A1. En-têtes mis à jour quand même.`);
    }

    console.log(`   ✍️  Écriture de ${headers.length} colonnes...`);
    await writeHeaders(SPREADSHEET_ID, tabName, headers, accessToken);

    console.log(`   🎨 Formatage (gras, couleur, gel, auto-resize)...`);
    await formatHeaderRow(SPREADSHEET_ID, sheetId, headers.length, accessToken);

    console.log(`   ✅ "${tabName}" configuré : ${headers.join(' | ')}`);
  }

  console.log('\n🎉 Google Sheet entièrement configuré !');
  console.log(`   Lien : https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  process.exit(1);
});
