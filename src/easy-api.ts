import { Router } from "express";

let router: Router;
export const easyApi = (): Router => router ?? (router = Router());
