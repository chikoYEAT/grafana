import { SelectableValue } from '@grafana/data';
import {
  AdHocFiltersVariable,
  ConstantVariable,
  CustomVariable,
  DataSourceVariable,
  IntervalVariable,
  TextBoxVariable,
  QueryVariable,
  SceneVariable,
} from '@grafana/scenes';
import { VariableType } from '@grafana/schema';

import { AdHocFiltersVariableEditor } from './editors/AdHocFiltersVariableEditor';
import { ConstantVariableEditor } from './editors/ConstantVariableEditor';
import { CustomVariableEditor } from './editors/CustomVariableEditor';
import { DataSourceVariableEditor } from './editors/DataSourceVariableEditor';
import { IntervalVariableEditor } from './editors/IntervalVariableEditor';
import { QueryVariableEditor } from './editors/QueryVariableEditor';
import { TextBoxVariableEditor } from './editors/TextBoxVariableEditor';

type EditableVariable =
  | typeof CustomVariable
  | typeof QueryVariable
  | typeof ConstantVariable
  | typeof IntervalVariable
  | typeof DataSourceVariable
  | typeof AdHocFiltersVariable
  | typeof TextBoxVariable;

interface EditableVariableConfig {
  name: string;
  description: string;
  Variable: EditableVariable;
  editor: React.ComponentType<any>;
}

export type EditableVariableType = Exclude<VariableType, 'system'>;

export function isEditableVariableType(type: VariableType): type is EditableVariableType {
  return type !== 'system';
}

const EDITABLE_VARIABLES: Record<EditableVariableType, EditableVariableConfig> = {
  custom: {
    name: 'Custom',
    description: 'Define variable values manually',
    Variable: CustomVariable,
    editor: CustomVariableEditor,
  },
  query: {
    name: 'Query',
    description: 'Variable values are fetched from a datasource query',
    Variable: QueryVariable,
    editor: QueryVariableEditor,
  },
  constant: {
    name: 'Constant',
    description: 'Define a hidden constant variable, useful for metric prefixes in dashboards you want to share',
    Variable: ConstantVariable,
    editor: ConstantVariableEditor,
  },
  interval: {
    name: 'Interval',
    description: 'Define a timespan interval (ex 1m, 1h, 1d)',
    Variable: IntervalVariable,
    editor: IntervalVariableEditor,
  },
  datasource: {
    name: 'Data source',
    description: 'Enables you to dynamically switch the data source for multiple panels',
    Variable: DataSourceVariable,
    editor: DataSourceVariableEditor,
  },
  adhoc: {
    name: 'Ad hoc filters',
    description: 'Add key/value filters on the fly',
    Variable: AdHocFiltersVariable,
    editor: AdHocFiltersVariableEditor,
  },
  textbox: {
    name: 'Textbox',
    description: 'Define a textbox variable, where users can enter any arbitrary string',
    Variable: TextBoxVariable,
    editor: TextBoxVariableEditor,
  },
};

const EDITABLE_VARIABLES_SELECT_ORDER: EditableVariableType[] = [
  'query',
  'custom',
  'textbox',
  'constant',
  'datasource',
  'interval',
  'adhoc',
];

export function getVariableTypeSelectOptions(): Array<SelectableValue<EditableVariableType>> {
  return EDITABLE_VARIABLES_SELECT_ORDER.map((variableType) => ({
    label: EDITABLE_VARIABLES[variableType].name,
    value: variableType,
    description: EDITABLE_VARIABLES[variableType].description,
  }));
}

export function getVariableEditor(type: EditableVariableType) {
  return EDITABLE_VARIABLES[type].editor;
}

export function getVariableScene(type: EditableVariableType) {
  return EDITABLE_VARIABLES[type].Variable;
}
