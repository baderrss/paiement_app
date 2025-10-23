import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor, MulterModule } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { diskStorage } from 'multer';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/uploads')
@ApiTags('Uploads Groupe')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }
    console.log('file uploaded : ', { file });
    return { message: 'File uploaded successfully' };
  }

  @Post('/multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('no file provided');
    }
    console.log('files uploaded : ', { files });
    return { message: 'Files uploaded successfully' };
  }

  @Get('/:image')
  showUploadedImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images' });
  }
}
