/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";

import {
    Boundary,
    BreadcrumbProps,
    Card,
    Checkbox,
    H5,
    InputGroup,
    Label,
    RadioGroup,
    Slider,
} from "@blueprintjs/core";
import { Example, ExampleProps, handleStringChange } from "@blueprintjs/docs-theme";
import { Breadcrumbs2 } from "@blueprintjs/popover2";

export interface Breadcrumbs2ExampleState {
    collapseFrom: Boundary;
    renderCurrentAsInput: boolean;
    alwaysRenderOverflow: boolean;
    width: number;
}

const COLLAPSE_FROM_RADIOS = [
    { label: "Start", value: Boundary.START.toString() },
    { label: "End", value: Boundary.END.toString() },
];

const ITEMS: BreadcrumbProps[] = [
    { icon: "folder-close", text: "All files" },
    { icon: "folder-close", text: "Users" },
    { icon: "folder-close", text: "Janet" },
    { href: "#", icon: "folder-close", text: "Photos" },
    { href: "#", icon: "folder-close", text: "Wednesday" },
    { icon: "document", text: "image.jpg", current: true },
];
// Show less items for always redner example so we can see when everything fits
const ITEMS_FOR_ALWAYS_RENDER: BreadcrumbProps[] = [
    { href: "#", icon: "folder-close", text: "Root" },
    { icon: "document", text: "image.jpg", current: true },
];

export class Breadcrumbs2Example extends React.PureComponent<ExampleProps, Breadcrumbs2ExampleState> {
    public state: Breadcrumbs2ExampleState = {
        alwaysRenderOverflow: false,
        collapseFrom: Boundary.START,
        renderCurrentAsInput: false,
        width: 50,
    };

    private handleChangeCollapse = handleStringChange(collapseFrom =>
        this.setState({ collapseFrom: collapseFrom as Boundary }),
    );

    private breadcrumbWidthLabelId = "num-visible-items-label";

    public render() {
        const options = (
            <>
                <H5>Props</H5>
                <RadioGroup
                    name="collapseFrom"
                    inline={true}
                    label="Collapse from"
                    onChange={this.handleChangeCollapse}
                    options={COLLAPSE_FROM_RADIOS}
                    selectedValue={this.state.collapseFrom.toString()}
                />
                <Checkbox
                    name="alwaysRenderOverflow"
                    label="Always render overflow"
                    onChange={this.handleChangeAlwaysRenderOverflow}
                    checked={this.state.alwaysRenderOverflow}
                />
                <Checkbox
                    name="renderCurrent"
                    label="Render current breadcrumb as input"
                    onChange={this.handleChangeRenderCurrentAsInput}
                    checked={this.state.renderCurrentAsInput}
                />
                <H5>Example</H5>
                <Label id={this.breadcrumbWidthLabelId}>Width</Label>
                <Slider
                    labelRenderer={this.renderLabel}
                    labelStepSize={50}
                    max={100}
                    onChange={this.handleChangeWidth}
                    showTrackFill={false}
                    value={this.state.width}
                    handleHtmlProps={{ "aria-labelledby": this.breadcrumbWidthLabelId }}
                />
            </>
        );

        const { collapseFrom, renderCurrentAsInput, width, alwaysRenderOverflow } = this.state;
        return (
            <Example options={options} {...this.props}>
                <Card elevation={0} style={{ width: `${width}%` }}>
                    <Breadcrumbs2
                        collapseFrom={collapseFrom}
                        items={alwaysRenderOverflow ? ITEMS_FOR_ALWAYS_RENDER : ITEMS}
                        currentBreadcrumbRenderer={renderCurrentAsInput ? this.renderBreadcrumbInput : undefined}
                        overflowListProps={{ alwaysRenderOverflow }}
                    />
                </Card>
            </Example>
        );
    }

    private renderLabel = (value: number) => {
        return `${value}%`;
    };

    private handleChangeWidth = (width: number) => this.setState({ width });

    private handleChangeRenderCurrentAsInput = () =>
        this.setState({ renderCurrentAsInput: !this.state.renderCurrentAsInput });

    private handleChangeAlwaysRenderOverflow = () =>
        this.setState({ alwaysRenderOverflow: !this.state.alwaysRenderOverflow });

    private renderBreadcrumbInput = ({ text }: BreadcrumbProps) => {
        return <BreadcrumbInput defaultValue={typeof text === "string" ? text : undefined} />;
    };
}

const BreadcrumbInput: React.FC<BreadcrumbProps & { defaultValue: string | undefined }> = props => {
    const [text, setText] = React.useState(props.defaultValue ?? "");
    const handleChange = React.useCallback((event: React.FormEvent<HTMLInputElement>) => {
        setText((event.target as HTMLInputElement).value);
    }, []);
    return <InputGroup placeholder="rename me" value={text} onChange={handleChange} />;
};
