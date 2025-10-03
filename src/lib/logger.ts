import { pino } from "pino";
import pretty from "pino-pretty";

const prettyStream = pretty({
  colorize: true,
  ignore: "pid,hostname",
  singleLine: true,
});

export const logger = pino(
  {
    level: "trace",
  },
  prettyStream,
);
