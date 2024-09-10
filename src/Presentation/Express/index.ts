import "reflect-metadata";
import {
  RegisterBookApplicationService,
  RegisterBookCommand,
} from "Application/Book/RegisterBookApplicationService/RegisterBookApplicationService";
import express, { json } from "express";
import "../../Program";
import { container } from "tsyringe";
import { GetBookApplicationService } from "Application/Book/GetBookApplicationService/GetBookApplicationService";
import {
  IncreaseBookStockApplicationService,
  IncreaseBookStockCommand,
} from "Application/Book/IncreaseBookStockApplicationService/IncreaseBookStockApplicationService";

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

app.get("/book/:isbn", async (req, res) => {
  try {
    const getBookApplicationService = container.resolve(
      GetBookApplicationService
    );
    console.log(req.params.isbn);
    const book = await getBookApplicationService.execute(req.params.isbn);

    res.json(book);
  } catch (error) {
    res.status(500).send({ message: (error as Error).message });
  }
});

app.post("/stock", async (req, res) => {
  try {
    const requestBody = req.body as {
      bookId: string;
      incrementAmount: number;
    };

    const increaseBookStockApplicationService = container.resolve(
      IncreaseBookStockApplicationService
    );
    const command: IncreaseBookStockCommand = requestBody;
    await increaseBookStockApplicationService.execute(command);

    res.status(201).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: (error as Error).message });
  }
});
