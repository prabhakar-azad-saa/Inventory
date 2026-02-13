import { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server/index";

const server = createServer();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve) => {
    server(req, res, () => {
      resolve(undefined);
    });
  });
}
