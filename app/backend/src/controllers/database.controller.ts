import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as DatabaseService from '../services/database.service';
import { sendSuccessResponse } from '../utils/responseHandler';
import { db } from '../utils/db.server';
import { v4 } from 'uuid';
import zlib from 'zlib';

const BACKUP_DIR =
  process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'backups') // Production backups in project directory
    : path.join(__dirname, '../../backups'); // Local backups in project directory

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const exportDatabase = async (request: Request, response: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup_${timestamp}.json${process.env.NODE_ENV === 'production' ? '.gz' : ''}`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    const databaseExport = await DatabaseService.exportDatabaseData();
    const jsonData = JSON.stringify(databaseExport, null, 2);

    if (process.env.NODE_ENV === 'production') {
      // In production, compress the backup using promisified gzip
      const compressedData = await new Promise<Buffer>((resolve, reject) => {
        zlib.gzip(jsonData, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      fs.writeFileSync(filePath, compressedData);
    } else {
      // In local, save without compression
      fs.writeFileSync(filePath, jsonData);
    }

    await db.backup.create({ data: { id: v4() } });

    response.download(filePath, fileName, async (err) => {
      if (err) {
        console.error('Error sending backup file:', err);
        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return response.status(500).json({ message: 'Có lỗi xảy ra khi backup database' });
      }

      // Remove file after successful download
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error: any) {
    console.error('Database export error:', error);
    // Cleanup on error in both environments
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(error);
  }
};

export const getLastBackupTime = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.user;
    const data = await DatabaseService.getLastBackupTime(user!);
    sendSuccessResponse(response, data);
  } catch (error: any) {
    next(error);
  }
};
