/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'pix8.agoda.net',
      'pix6.agoda.net',
      'pix5.agoda.net',
      'pix4.agoda.net',
      'pix3.agoda.net',
      'pix2.agoda.net',
      'pix1.agoda.net',
      'pix0.agoda.net',
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost'
    ],
    unoptimized: true
  },
};

export default nextConfig;
