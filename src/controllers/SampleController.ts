// src/controllers/SampleController.ts

import {
  controller,
  httpGet,
  httpPost,
  request,
  response,
  requestBody,
} from "inversify-express-utils";
import { SampleService } from "../services/SampleService";
import { Request, Response } from "express";
import { SampleModel } from "../models/SampleModel";

@controller("/api/sample")
class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  /**
   * @swagger
   * /sample:
   *  get:
   *   description: Get all samples
   *  responses:
   *  200:
   *  description: Success
   *  schema: ../models/SampleModel.ts
   * 404:
   *  description: Not found
   */
  @httpGet("/")
  async getAll(
    @request() req: Request,
    @response() res: Response
  ): Promise<void> {
    const samples = await this.sampleService.getAll();
    res.json(samples);
  }

  @httpGet("/:id")
  async getById(
    @request() req: Request,
    @response() res: Response
  ): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const sample = await this.sampleService.getById(id);

    if (sample) {
      res.json(sample);
    } else {
      res.status(404).json({ message: "Sample not found" });
    }
  }

  //genetae swagger doc
  /**
   * @swagger
   * /sample:
   *  post:
   *   description: Create a sample
   *   parameters:
   *    - name: body
   *      in: body
   *      required: true
   *      schema:
   *       type: object
   *       properties:
   *        name:
   *         type: string
   *   responses:
   *    200:
   *     description: Success
   *     schema: ../models/SampleModel.ts
   *    400:
   *     description: Bad request
   *    500:
   *     description: Internal server error
   */
  @httpPost("/")
  async create(
    @requestBody() body: SampleModel,
    @response() res: Response
  ): Promise<void> {
    const { name } = body;
    const sample = await this.sampleService.create(name);
    res.json(sample);
  }
}

export { SampleController };
