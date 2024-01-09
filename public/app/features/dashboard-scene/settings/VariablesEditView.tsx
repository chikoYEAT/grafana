import React from 'react';

import { NavModel, NavModelItem, PageLayoutType } from '@grafana/data';
import {
  SceneComponentProps,
  SceneObjectBase,
  SceneVariable,
  AdHocFiltersVariable,
  SceneVariables,
  sceneGraph,
  AdHocFilterSet,
} from '@grafana/scenes';
import { Page } from 'app/core/components/Page/Page';

import { DashboardScene } from '../scene/DashboardScene';
import { NavToolbarActions } from '../scene/NavToolbarActions';
import { getDashboardSceneFor } from '../utils/utils';

import { EditListViewSceneUrlSync } from './EditListViewSceneUrlSync';
import { DashboardEditView, DashboardEditViewState, useDashboardEditPageNav } from './utils';
import { VariableEditorForm } from './variables/VariableEditorForm';
import { VariableEditorList } from './variables/VariableEditorList';
import { EditableVariableType, getVariableScene } from './variables/utils';
export interface VariablesEditViewState extends DashboardEditViewState {
  editIndex?: number | undefined;
}

export class VariablesEditView extends SceneObjectBase<VariablesEditViewState> implements DashboardEditView {
  public static Component = VariableEditorSettingsListView;

  public getUrlKey(): string {
    return 'variables';
  }

  protected _urlSync = new EditListViewSceneUrlSync(this);

  public getDashboard(): DashboardScene {
    return getDashboardSceneFor(this);
  }

  public getVariableSet(): SceneVariables {
    return sceneGraph.getVariables(this.getDashboard());
  }

  private getVariableIndex = (identifier: string) => {
    const variables = this.getVariables();
    return variables.findIndex((variable) => variable.state.name === identifier);
  };

  public onDelete = (identifier: string) => {
    // Find the index of the variable to be deleted
    const variableIndex = this.getVariableIndex(identifier);
    const { variables } = this.getVariableSet().state;
    if (variableIndex === -1) {
      // Handle the case where the variable is not found
      console.error('Variable not found');
      return;
    }

    // Create a new array excluding the variable to be deleted
    const updatedVariables = [...variables.slice(0, variableIndex), ...variables.slice(variableIndex + 1)];

    // Update the state or the variables array
    this.getVariableSet().setState({ variables: updatedVariables });
  };

  public getVariables() {
    return this.getVariableSet().state.variables;
  }

  public onDuplicated = (identifier: string) => {
    const variableIndex = this.getVariableIndex(identifier);
    const variables = this.getVariableSet().state.variables;

    if (variableIndex === -1) {
      console.error('Variable not found');
      return;
    }

    const originalVariable = variables[variableIndex];
    let copyNumber = 0;
    let newName = `copy_of_${originalVariable.state.name}`;

    // Check if the name is unique, if not, increment the copy number
    while (variables.some((v) => v.state.name === newName)) {
      copyNumber++;
      newName = `copy_of_${originalVariable.state.name}_${copyNumber}`;
    }

    //clone the original variable

    const newVariable = originalVariable.clone(originalVariable.state);
    // update state name of the new variable
    newVariable.setState({ name: newName });

    const updatedVariables = [
      ...variables.slice(0, variableIndex + 1),
      newVariable,
      ...variables.slice(variableIndex + 1),
    ];

    this.getVariableSet().setState({ variables: updatedVariables });
  };

  public onOrderChanged = (fromIndex: number, toIndex: number) => {
    const variables = this.getVariableSet().state.variables;
    if (!this.getVariableSet()) {
      return;
    }
    // check the index are within the variables array
    if (fromIndex < 0 || fromIndex >= variables.length || toIndex < 0 || toIndex >= variables.length) {
      console.error('Invalid index');
      return;
    }
    const updatedVariables = [...variables];
    // Remove the variable from the array
    const movedItem = updatedVariables.splice(fromIndex, 1);
    updatedVariables.splice(toIndex, 0, movedItem[0]);
    const variablesScene = this.getVariableSet();
    variablesScene.setState({ variables: updatedVariables });
  };

  public onEdit = (identifier: string) => {
    const variableIndex = this.getVariableIndex(identifier);
    if (variableIndex === -1) {
      console.error('Variable not found');
      return;
    }
    this.setState({ editIndex: variableIndex });
  };

  public onTypeChange = (type: EditableVariableType) => {
    // Find the index of the variable to be deleted
    const variableIndex = this.state.editIndex;
    const { variables } = this.getVariableSet().state;
    const variable = variableIndex && variables[variableIndex];

    if (!variable) {
      // Handle the case where the variable is not found
      console.error('Variable not found');
      return;
    }

    const Variable = getVariableScene(type);
    const newVariable =
      Variable === AdHocFiltersVariable
        ? // FIXME: Remove set and type as required properties from AdHocFiltersVariable in @grafana/scenes
          // @ts-ignore
          new Variable({ ...variable.state, set: new AdHocFilterSet({}), type: 'adhoc' })
        : new Variable({ ...variable.state });
    const updatedVariables = [...variables.slice(0, variableIndex), newVariable, ...variables.slice(variableIndex + 1)];

    // Update the state or the variables array
    this.getVariableSet().setState({ variables: updatedVariables });
  };

  public onGoBack = () => {
    this.setState({ editIndex: undefined });
  };
}

function VariableEditorSettingsListView({ model }: SceneComponentProps<VariablesEditView>) {
  const dashboard = model.getDashboard();
  const { navModel, pageNav } = useDashboardEditPageNav(dashboard, model.getUrlKey());
  // get variables from dashboard state
  const { onDelete, onDuplicated, onOrderChanged, onEdit, onTypeChange, onGoBack } = model;
  const { variables } = model.getVariableSet().useState();
  const { editIndex } = model.useState();

  if (editIndex !== undefined && variables[editIndex]) {
    const variable = variables[editIndex];
    if (variable) {
      return (
        <VariableEditorSettingsView
          variable={variable}
          onTypeChange={onTypeChange}
          onGoBack={onGoBack}
          pageNav={pageNav}
          navModel={navModel}
          dashboard={dashboard}
        />
      );
    }
  }

  return (
    <Page navModel={navModel} pageNav={pageNav} layout={PageLayoutType.Standard}>
      <NavToolbarActions dashboard={dashboard} />
      <VariableEditorList
        variables={variables}
        onDelete={onDelete}
        onDuplicate={onDuplicated}
        onChangeOrder={onOrderChanged}
        onAdd={() => {}}
        onEdit={onEdit}
      />
    </Page>
  );
}

interface VariableEditorSettingsEditViewProps {
  variable: SceneVariable;
  pageNav: NavModelItem;
  navModel: NavModel;
  dashboard: DashboardScene;
  onTypeChange: (variableType: EditableVariableType) => void;
  onGoBack: () => void;
}

function VariableEditorSettingsView({
  variable,
  pageNav,
  navModel,
  dashboard,
  onTypeChange,
  onGoBack,
}: VariableEditorSettingsEditViewProps) {
  const parentTab = pageNav.children!.find((p) => p.active)!;
  parentTab.parentItem = pageNav;
  const { name } = variable.useState();

  const editVariablePageNav = {
    text: name,
    parentItem: parentTab,
  };
  return (
    <Page navModel={navModel} pageNav={editVariablePageNav} layout={PageLayoutType.Standard}>
      <NavToolbarActions dashboard={dashboard} />
      <VariableEditorForm variable={variable} onTypeChange={onTypeChange} onGoBack={onGoBack} />
    </Page>
  );
}
