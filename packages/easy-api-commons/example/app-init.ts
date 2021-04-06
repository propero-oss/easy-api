import express, { Application } from "express";
import { createMount } from "src/util";

export const app: Application = express();
export const { Mount, initialized } = createMount(app);
