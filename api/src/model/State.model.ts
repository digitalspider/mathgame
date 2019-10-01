import { Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { InterfaceKeyValue } from './InterfaceKeyValue';

@Table({
  tableName: 'state',
  modelName: 'State',
  timestamps: false,
})
class State extends Model<State> implements InterfaceKeyValue {
  @PrimaryKey
  @Column
  key!: string;

  @Unique
  @Column
  value!: string;

  selected: boolean = false;
}

export { State };

