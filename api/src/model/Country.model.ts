import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { InterfaceKeyValue } from './InterfaceKeyValue';

@Table({
  tableName: 'country',
  modelName: 'Country',
  timestamps: true,
})
class Country extends Model<Country> implements InterfaceKeyValue {
  @PrimaryKey
  @Column
  key!: string;

  @Unique
  @Column
  value!: string;
}

export { Country };

