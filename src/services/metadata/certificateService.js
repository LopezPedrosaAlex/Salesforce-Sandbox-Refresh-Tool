require('dotenv').config();
const fs = require('fs');
const { batchIt } = require('@utils/metadataUtils.js');
const { FILES_DIR } = require('@config/paths.js');

const retrieveCertificates = async (connection) => {
    try {
        const certificatesMetadata = await connection.metadata.list([{ type: 'Certificate' }], process.env.API_VERSION);
        const certificatesContent = await connection.metadata.read('Certificate', certificatesMetadata.map(cert => cert.fullName));
        fs.writeFileSync(FILES_DIR.CERTIFICATES_METADATA_FILE, JSON.stringify(certificatesContent, null, 2));
    } catch (error) {
        console.error('Error retrieving certificates:', error);
        throw error;
    }
};

const deleteCertificatesFromAFile = async (filePath, connection) => {
    try {
        fs.promises.readFile(filePath, 'utf8').then(async result => {
            const metadataParsed = JSON.parse(result).map(element => {
                return element.fullName;
            });
            for (const batch of batchIt(200, metadataParsed)) {
                await connection.metadata.delete('Certificate', batch);
            }
        });
    } catch (error) {
        console.error('Error deleting certificates:', error);
        throw error;
    }
};

const createCertificatesFromAFile = async (filePath, connection) => {
    try {
        const certificatesData = await fs.promises.readFile(filePath, 'utf8');
        const certificates = JSON.parse(certificatesData);
        for (const batch of batchIt(200, certificates)) {
            await connection.metadata.create('Certificate', batch);
        }
    } catch (error) {
        console.error('Error creating certificates:', error);
        throw error;
    }
};

module.exports = {
    retrieveCertificates, 
    deleteCertificatesFromAFile,
    createCertificatesFromAFile
};
