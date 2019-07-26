/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MessageItem } from 'vscode';
import { AzureParentTreeItem, IActionContext, parseError } from "vscode-azureextensionui";
import { configurationSettings, extensionPrefix } from "../../constants";
import { SubscriptionTreeItem } from '../../explorer/SubscriptionTreeItem';
import { WebAppTreeItem } from "../../explorer/WebAppTreeItem";
import { ext } from "../../extensionVariables";
import { getGlobalSetting, updateGlobalSetting } from '../../vsCodeConfig/settings';

export async function createWebApp(context: IActionContext, node?: AzureParentTreeItem | undefined): Promise<void> {
    if (!node) {
        node = <AzureParentTreeItem>await ext.tree.showTreeItemPicker(SubscriptionTreeItem.contextValue, context);
    }

    let newSite: WebAppTreeItem | undefined;
    try {
        newSite = <WebAppTreeItem>await node.createChild(context);
    } catch (error) {
        const advancedCreation: boolean | undefined = getGlobalSetting(configurationSettings.advancedCreation);
        if (!parseError(error).isUserCancelledError && !advancedCreation) {

            const message: string = `Modify the setting "${extensionPrefix}.${configurationSettings.advancedCreation}" if you want to change the default values when creating a Web App in Azure.`;
            const btn: MessageItem = { title: 'Turn on advanced creation' };
            // tslint:disable-next-line: no-floating-promises
            ext.ui.showWarningMessage(message, btn).then(async result => {
                if (result === btn) {
                    await updateGlobalSetting('advancedCreation', true);
                }
            });
        }
        throw error;
    }

    newSite.promptToDeploy(context);
}
