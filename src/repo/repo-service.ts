import { Body, Delete, Get, Param, Post, Put, Query } from "src/decorator";
import { MongoClient, Collection } from "mongodb";
import { PagingResponse } from "src/repo/paging-response";

export class RepoService<Type> {
  constructor(protected collection: Collection<Type>, protected id: keyof Type = "_id" as any) {}

  @Get("/:id")
  public async getOne(@Param("id") id: string): Promise<Type | null> {
    return await this.collection.findOne({ [this.id]: id } as any);
  }

  @Get("/")
  public async getMany(
    @Query("filter") filter: string,
    @Query("top", parseInt) top: number,
    @Query("skip", parseInt) skip: number,
    @Query("sort") sort: string
  ): Promise<PagingResponse<Type>> {
    const cursor = await this.collection.find<Type>().limit(top).skip(skip);
    const data = await cursor.toArray();
    const total = await cursor.count();
    return { data, total, skip, top };
  }

  @Post("/")
  public async createOne(@Body() data: Type): Promise<Type> {
    const result = await this.collection.insertOne(data as any);
    return (await this.getOne(result.insertedId as any))!;
  }

  @Post("/:id")
  public async patchOne(@Param("id") id: string, @Body() data: Partial<Type>): Promise<Type> {
    return (await this.collection.findOneAndUpdate({ [this.id]: id } as any, data, { upsert: true })).value!;
  }

  @Put("/:id")
  public async updateOne(@Param("id") id: string, @Body() data: Type): Promise<Type> {
    return (await this.collection.findOneAndUpdate({ [this.id]: id } as any, data)).value!;
  }

  @Delete("/:id")
  public async deleteOne(@Param("id") id: string): Promise<void> {
    await this.collection.deleteOne({ [this.id]: id } as any);
  }
}
