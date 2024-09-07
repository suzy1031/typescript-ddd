import {
  RegisterBookApplicationService,
  RegisterBookCommand,
} from "Application/Book/RegisterBookApplicationService/RegisterBookApplicationService";
import express, { json } from "express";
import "reflect-metadata";
import "../../Program";
import { container } from "tsyringe";

const app = express();
const port = 3000;

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(json());
app.post("/book", async (req, res) => {
  try {
    const requestBody = req.body as {
      isbn: string;
      title: string;
      priceAmount: number;
    };

    // const clientManager = new PrismaClientManager();
    // const transactionManager = new PrismaTransactionManager(clientManager);
    // const bookRepository = new PrismaBookRepository(clientManager);
    // const registerBookApplicationService = new RegisterBookApplicationService(
    //   bookRepository,
    //   transactionManager
    // );

    // 依存オブジェクトのインスタンス化と依存関係の解決を行うコードをProgram.tsに集約
    const registerBookApplicationService = container.resolve(
      RegisterBookApplicationService
    );

    const registerBookCommand: RegisterBookCommand = requestBody;
    await registerBookApplicationService.execute(registerBookCommand);

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});
