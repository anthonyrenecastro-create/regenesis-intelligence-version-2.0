
/**
 * Utility for processing images in the browser using Canvas.
 */

export interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
    quality?: number;
}

export const processImage = async (file: File, options: ResizeOptions): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (options.maxWidth && width > options.maxWidth) {
                height *= options.maxWidth / width;
                width = options.maxWidth;
            }
            if (options.maxHeight && height > options.maxHeight) {
                width *= options.maxHeight / height;
                height = options.maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not create canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                },
                options.format || 'image/jpeg',
                options.quality || 0.9
            );
        };
        img.onerror = () => reject(new Error("Image load failed"));
    });
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
