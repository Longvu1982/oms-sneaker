import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as DatabaseService from '../services/database.service';
import { sendSuccessResponse } from '../utils/responseHandler';
import { db } from '../utils/db.server';
import { v4 } from 'uuid';

export const exportDatabase = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const databaseExport = await DatabaseService.exportDatabaseData();

    const fileName = `backup_${Date.now()}.json`;
    const jsonData = JSON.stringify(databaseExport, null, 2);

    fs.writeFileSync(fileName, jsonData);
    await db.backup.create({ data: { id: v4() } });

    response.sendFile(path.join(__dirname, '../../', fileName), async (err) => {
      if (err) {
        console.log(err);
        return response.status(500).json({ message: 'Có lỗi xảy ra khi backup database' });
      }
      fs.unlinkSync(fileName);
    });
  } catch (error: any) {
    next(error);
  }
};

export const getLastBackupTime = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const data = await DatabaseService.getLastBackupTime();
    sendSuccessResponse(response, data);
  } catch (error: any) {
    next(error);
  }
};
