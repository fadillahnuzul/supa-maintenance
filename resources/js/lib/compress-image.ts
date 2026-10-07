const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
    if (file.type && !file.type.startsWith('image/')) {
        throw new Error('File yang dipilih bukan gambar.');
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const element = new Image();

            element.onload = () => resolve(element);
            element.onerror = () =>
                reject(new Error('Gambar tidak dapat dibuka.'));
            element.src = objectUrl;
        });

        const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION /
                Math.max(image.naturalWidth, image.naturalHeight),
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Gambar tidak dapat diproses.');
        }

        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const compressedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Gambar tidak dapat dikompres.'));

                        return;
                    }

                    resolve(blob);
                },
                'image/jpeg',
                JPEG_QUALITY,
            );
        });

        const fileName = file.name.replace(/\.[^.]+$/, '') || 'photo';

        return new File([compressedBlob], `${fileName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
