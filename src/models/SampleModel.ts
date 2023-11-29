import {
  Model,
  Table,
  Column,
  DataType,
  AllowNull,
  Scopes,
  DefaultScope,
} from "sequelize-typescript";
import { IsNotEmpty, IsString } from "class-validator";

@DefaultScope(() => ({
  attributes: { exclude: ["createdAt", "updatedAt"] },
}))
@Scopes(() => ({
  full: {
    attributes: { include: ["createdAt", "updatedAt"] },
  },
}))
@Table({
  tableName: "sample_models",
  timestamps: true,
})
export class SampleModel extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: { msg: "Name cannot be empty" },
    },
  })
  @IsNotEmpty({ message: "Name cannot be empty" })
  @IsString({ message: "Name must be a string" })
  public name!: string;
}

