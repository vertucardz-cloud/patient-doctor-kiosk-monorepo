import { createCanvas, loadImage } from "canvas";
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { WHATS_APP } from '@config/environment.config';

const whatsappNumber: string = WHATS_APP.NUMBER;

// Franchise information interface
interface Franchise {
  id: string;
  location: string;
}

/**
 * Generate a QR image from a given code string
 * @param code The string to encode as QR
 * @returns A base64 PNG data URL
 */
export const generateQRImage = async (franchise: Franchise): Promise<string> => {
  if (!franchise?.id || !franchise?.location) {
    return '';
  }

  const message = `Hello, I have an issue at Franchise ID: ${franchise.id}, Location: ${franchise.location}. Here is my problem:`;
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  try {
    return await QRCode.toDataURL(waUrl, {
      type: 'image/png',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });
  } catch (error: any) {
    return '';
  }
};

// Function to generate QR code and return URL path to frontend
export const generateFranchiseQrCode = (franchise: Franchise): Promise<string> => {
  return new Promise((resolve, reject) => {
    const message: string = `Hello, I have an issue at Franchise ID: ${franchise.id}, Location: ${franchise.location}. Here is my problem:`;
    const encodedMessage: string = encodeURIComponent(message);
    const waUrl: string = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    const filename = `qr_${franchise.id}.png`;
    const filepath = path.join(__dirname, filename);

    QRCode.toFile(
      filepath,
      waUrl,
      {
        color: {
          dark: '#000',
          light: '#fff',
        },
      },
      (err: any) => {
        if (err) return reject(err);
        resolve(`/static/${filename}`);
      }
    );
  });
};




export const generateQRWithDetails = async (franchise: Franchise): Promise<string> => {
  if (!franchise?.id || !franchise?.location) {
    return "";
  }

  const brandName = "My Healthcare Brand";
  const description = "Scan this QR to report an issue or connect with us.";
  const doctorName = "Dr. John Doe";
  const franchiseAddress = franchise.location;

  const message = `Hello, I have an issue at Franchise ID: ${franchise.id}, Location: ${franchise.location}. Here is my problem:`;
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodedMessage}`;

  try {
    // Generate QR Code as Data URL
    const qrDataUrl = await QRCode.toDataURL(waUrl, {
      type: "image/png",
      errorCorrectionLevel: "H",
      margin: 1,
      width: 250,
    });

    // Create canvas (width x height)
    const canvas = createCanvas(500, 700);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    // Brand Name
    ctx.font = "bold 28px Arial";
    ctx.fillText(brandName, canvas.width / 2, 60);

    // Description
    ctx.font = "16px Arial";
    ctx.fillText(description, canvas.width / 2, 100);

    // Doctor Name
    ctx.font = "18px Arial";
    ctx.fillText(doctorName, canvas.width / 2, 140);

    // Load QR Code in center
    const qrImage = await loadImage(qrDataUrl);
    ctx.drawImage(qrImage, (canvas.width - 250) / 2, 180, 250, 250);

    // Franchise Address (bottom)
    ctx.font = "16px Arial";
    ctx.fillText(franchiseAddress, canvas.width / 2, 480);

    return canvas.toDataURL("image/png"); // Base64 image
  } catch (error) {
    console.error(error);
    return "";
  }
};

