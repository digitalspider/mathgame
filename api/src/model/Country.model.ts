import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { InterfaceKeyValue } from './InterfaceKeyValue';

@Table({
  tableName: 'country',
  modelName: 'Country',
  timestamps: false,
})
class Country extends Model<Country> implements InterfaceKeyValue {
  @PrimaryKey
  @Column
  key!: string;

  @Unique
  @Column
  value!: string;

  selected: boolean = false;
}

export { Country };

