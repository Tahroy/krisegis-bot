import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https'; // Import pour l'agent HTTPS

export class PicturesManager {
    static async fetchImageIfNeeded(imageUrl: string, imageName: string, folder: string): Promise<string> {
        const publicFolderPath = path.join(__dirname, `./../../public`, folder);
        const imagePath = path.join(publicFolderPath, imageName);

        // Vérifie si le dossier public existe, sinon le crée
        if (!fs.existsSync(publicFolderPath)) {
            console.log(`Création du dossier : ${publicFolderPath}`);
            fs.mkdirSync(publicFolderPath, { recursive: true });
        }

        // Vérifie si le fichier existe déjà
        if (!fs.existsSync(imagePath)) {
            console.log(`Téléchargement de l'image : ${imageUrl}`);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            });

            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                httpsAgent
            });
            fs.writeFileSync(imagePath, response.data);
        } else {
            console.log(`L'image existe déjà : ${imagePath}`);
        }

        return `./public/${folder}/${imageName}`;
    }

}