export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, anliegen } = req.body;

    if (!name || !email || !anliegen) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
    }

    const token = process.env.SLACK_BOT_TOKEN;
    const channelId = process.env.SLACK_CHANNEL_ID;
    const dmId = process.env.SLACK_DM_ID;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 Neue Anfrage – zerohumancompany.de',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*👤 Name:*\n${name}` },
          { type: 'mrkdwn', text: `*📧 E-Mail:*\n${email}` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*💬 Anliegen:*\n${anliegen}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} | 🌐 zerohumancompany.de`
          }
        ]
      }
    ];

    const fallbackText = `Neue Anfrage von ${name} (${email}): ${anliegen}`;

    // Send to channel
    const channelPromise = fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        channel: channelId,
        blocks,
        text: fallbackText
      })
    });

    // Send to DM (open conversation first if needed)
    const dmPromise = (async () => {
      try {
        // Open DM conversation
        const openRes = await fetch('https://slack.com/api/conversations.open', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ users: dmId })
        });
        const openData = await openRes.json();
        const dmChannel = openData.channel?.id || dmId;

        // Send to DM
        return fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            channel: dmChannel,
            blocks,
            text: fallbackText
          })
        });
      } catch (e) {
        console.error('DM send failed:', e);
      }
    })();

    // Fire both in parallel
    await Promise.all([channelPromise, dmPromise]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
