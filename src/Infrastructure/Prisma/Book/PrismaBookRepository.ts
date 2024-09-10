import { $Enums } from "@prisma/client";
import { Book } from "Domain/models/Book/Book";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { IBookRepository } from "Domain/models/Book/IBookRepository";
import { Price } from "Domain/models/Book/Price/Price";
import { QuantityAvailable } from "Domain/models/Book/Stock/QuantityAvailable/QuantityAvailable";
import { Status, StatusEnum } from "Domain/models/Book/Stock/Status/Status";
import { Stock } from "Domain/models/Book/Stock/Stock";
import { StockId } from "Domain/models/Book/Stock/StockId/StockId";
import { Title } from "Domain/models/Book/Title/Title";
import { PrismaClientManager } from "../PrismaClientManager";
import { inject, injectable } from "tsyringe";

// classが特定のインターフェイスを実装する= IBookRepository
// クラスがインターフェイスで定義されたプロパティやメソッドを持つことを強制する= save / update / delete / find
// IBookRepositoryのメソッドの実態は、prismaのメソッドを呼び出す
// prismaは直接定義されていないが、clientManagerを通じてprismaのメソッドを呼び出す
// ref: https://zenn.dev/lyio/articles/fab176ca55d415
@injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(
    @inject("IDataAccessClientManager")
    private clientManger: PrismaClientManager
  ) {}

  private statusDataMapper(
    status: StatusEnum
  ): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
    switch (status) {
      case StatusEnum.InStock:
        return "IN_STOCK";
      case StatusEnum.LowStock:
        return "LOW_STOCK";
      case StatusEnum.OutOfStock:
        return "OUT_OF_STOCK";
    }
  }

  private statusEnumMapper(status: $Enums.Status): Status {
    switch (status) {
      case "IN_STOCK":
        return new Status(StatusEnum.InStock);
      case "LOW_STOCK":
        return new Status(StatusEnum.LowStock);
      case "OUT_OF_STOCK":
        return new Status(StatusEnum.OutOfStock);
    }
  }

  async save(book: Book) {
    // client -> prisma
    const client = this.clientManger.getClient();

    // prisma.book.create
    await client.book.create({
      data: {
        bookId: book.bookId.value,
        title: book.title.value,
        priceAmount: book.price.amount,
        stock: {
          create: {
            stockId: book.stockId.value,
            quantityAvailable: book.quantityAvailable.value,
            status: this.statusDataMapper(book.status.value),
          },
        },
      },
    });
  }

  async update(book: Book) {
    const client = this.clientManger.getClient();

    await client.book.update({
      where: {
        bookId: book.bookId.value,
      },
      data: {
        title: book.title.value,
        priceAmount: book.price.amount,
        stock: {
          update: {
            quantityAvailable: book.quantityAvailable.value,
            status: this.statusDataMapper(book.status.value),
          },
        },
      },
    });
  }

  async delete(bookId: BookId) {
    const client = this.clientManger.getClient();

    await client.book.delete({
      where: {
        bookId: bookId.value,
      },
    });
  }

  async find(bookId: BookId): Promise<Book | null> {
    const client = this.clientManger.getClient();

    const data = await client.book.findUnique({
      where: {
        bookId: bookId.value,
      },
      include: {
        stock: true,
      },
    });

    if (!data || !data.stock) {
      return null;
    }

    return Book.reconstruct(
      new BookId(data.bookId),
      new Title(data.title),
      new Price({ amount: data.priceAmount, currency: "JPY" }),
      Stock.reconstruct(
        new StockId(data?.stock?.stockId),
        new QuantityAvailable(data.stock.quantityAvailable),
        this.statusEnumMapper(data.stock.status)
      )
    );
  }
}
