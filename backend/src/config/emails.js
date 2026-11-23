require('dotenv').config();

const EMAILS = {
    REFRESH_WARNING: {
        SUBJECT: 'Upcoming Salesforce Sandbox Refresh – Action Required',
        BODY: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Salesforce Sandbox Refresh Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Dear <strong>IT Team</strong>,</p>

  <p>We would like to inform you that we are planning to refresh our Salesforce Sandbox environments on <strong>${process.env.REFRESH_DATE}</strong>.</p>

  <p>As part of this refresh:</p>
  <ul>
    <li>All sandbox data will be overwritten.</li>
    <li>Integration user accounts will be reset, and <strong>new passwords or tokens</strong> will be required for continued access.</li>
  </ul>

  <h3 style="color: #005A9C;">Affected Integration Users:</h3>
  <ul>
    <li>integration.user1@example.com</li>
    <li>integration.user2@example.com</li>
    <li>api.connector@example.com</li>
  </ul>

  <p>Once the refresh is complete, we will provide you with the updated credentials for these users. Please ensure your systems are ready to update the integration settings accordingly to avoid any service disruption.</p>

  <p>If you have any questions or need support during this transition, feel free to reach out.</p>

  <p>Thank you for your attention and cooperation.</p>

  <p>Best regards,<br>
  Alex Lopez Pedrosa<br>
  IT Apps Functional Analyst<br>
</body>
</html>
`
    }
};

module.exports = {
    EMAILS
};
