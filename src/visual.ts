/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less"; // Import the CSS

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
  private target: HTMLElement;
  private host: IVisualHost;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private contentElement: HTMLElement;

  constructor(options: VisualConstructorOptions) {
    console.log("Visual constructor", options);
    this.target = options.element;
    this.host = options.host;
    this.formattingSettingsService = new FormattingSettingsService();

    if (document) {
      this.contentElement = document.createElement("div");
      this.contentElement.style.overflow = "auto";
      this.contentElement.style.height = "100%";
      this.contentElement.style.width = "100%";
      this.target.appendChild(this.contentElement);
    }
  }

  public update(options: VisualUpdateOptions) {
    this.formattingSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        options.dataViews[0]
      );

    console.log("Visual update", options);

    // Get the value from the toggle switch in the new card
    const showDebug =
      this.formattingSettings.debugSettingsCard.showDebugInfo.value; // <-- Updated path

    if (this.contentElement) {
      if (showDebug) {
        const debugInfo = {
          viewport: options.viewport,
          dataView: options.dataViews[0],
          settings: this.formattingSettings,
        };
        this.contentElement.innerHTML = `<pre>${JSON.stringify(
          debugInfo,
          null,
          2
        )}</pre>`;
      } else {
        let message = "Boilerplate Visual Updated";
        const dataView: DataView = options.dataViews[0];

        if (
          dataView &&
          dataView.categorical &&
          dataView.categorical.categories &&
          dataView.categorical.categories[0] &&
          dataView.categorical.categories[0].values &&
          dataView.categorical.categories[0].values.length > 0
        ) {
          message = `First Category: ${dataView.categorical.categories[0].values[0]}`;
        } else {
          message =
            "Please add data to the 'Category Data' field.";
        }
        this.contentElement.innerHTML = `<p>${message}</p>`;
      }
    }
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}
