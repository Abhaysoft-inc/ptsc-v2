/** Whether an image link points at our Cloudinary account's CDN. */
export const isCloudinary = (url: string) => /^https:\/\/res\.cloudinary\.com\//.test(url);
