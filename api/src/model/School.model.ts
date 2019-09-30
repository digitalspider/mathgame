import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { InterfaceKeyValue } from './InterfaceKeyValue';

@Table({
  tableName: 'school',
  modelName: 'School',
  timestamps: true,
})
class School extends Model<School> implements InterfaceKeyValue {
  @PrimaryKey
  @Column
  key!: string;

  @Unique
  @Column
  value!: string;

  selected: boolean = false;
}

export { School };

