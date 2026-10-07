// GENERATED from schema/ghjson.schema.json — do not edit by hand; run `pnpm codegen`.

/**
 * Represents a single Grasshopper component or floating parameter.
 */
export type ComponentData = ComponentData1 & {
  /**
   * The name of the component. Must match the component's name in the Grasshopper library.
   */
  name?: string;
  /**
   * The component library/category (e.g., 'Maths', 'Params').
   */
  library?: string;
  /**
   * Custom nickname for the component.
   */
  nickName?: string;
  /**
   * The unique identifier for the component type. Used to instantiate the correct component class.
   */
  componentGuid?: string;
  /**
   * The unique identifier for this specific component instance.
   */
  instanceGuid?: string;
  /**
   * Integer ID for compact reference in connections and groups. Must be unique within the document. Each instanceGuid is assigned a unique ID.
   */
  id?: number;
  /**
   * The position of a component on the Grasshopper canvas.
   */
  pivot?:
    | string
    | {
        /**
         * The X coordinate on the canvas.
         */
        x: number;
        /**
         * The Y coordinate on the canvas.
         */
        y: number;
      };
  /**
   * Configuration for input parameters.
   */
  inputSettings?: ParameterSettings[];
  /**
   * Configuration for output parameters.
   */
  outputSettings?: ParameterSettings[];
  componentState?: ComponentState;
  /**
   * List of error messages associated with the component.
   */
  errors?: string[];
  /**
   * List of warning messages associated with the component.
   */
  warnings?: string[];
  /**
   * List of remarks associated with the component.
   */
  remarks?: string[];
};
export type ComponentData1 = {
  [k: string]: unknown;
};
/**
 * The source endpoint (output parameter).
 */
export type ConnectionEndpoint = {
  [k: string]: unknown;
} & {
  /**
   * The integer ID of the component.
   */
  id?: number;
  /**
   * The name of the parameter on the component.
   */
  paramName?: string;
  /**
   * The zero-based index of the parameter. Used for reliable matching regardless of display name settings.
   */
  paramIndex?: number;
};
/**
 * The target endpoint (input parameter).
 */
export type ConnectionEndpoint1 = {
  [k: string]: unknown;
} & {
  /**
   * The integer ID of the component.
   */
  id?: number;
  /**
   * The name of the parameter on the component.
   */
  paramName?: string;
  /**
   * The zero-based index of the parameter. Used for reliable matching regardless of display name settings.
   */
  paramIndex?: number;
};
/**
 * A Grasshopper group containing multiple components.
 */
export type GroupData = GroupData1 & {
  /**
   * The unique identifier for this group instance.
   */
  instanceGuid?: string;
  /**
   * The integer ID of the group. Must be unique within the file.
   */
  id?: number;
  /**
   * The name of the group.
   */
  name?: string;
  /**
   * The group color in ARGB format (e.g., 'argb:255,0,200,0').
   */
  color?: string;
  /**
   * List of component integer IDs that belong to this group.
   */
  members?: number[];
};
export type GroupData1 = {
  [k: string]: unknown;
};

/**
 * GhJSON is a JSON-based format for representing Grasshopper definitions. It provides a human-readable, portable way to serialize and deserialize Grasshopper documents.
 */
export interface GhJSONDocument {
  /**
   * The GhJSON schema version. Used for compatibility checking.
   */
  schema?: string;
  metadata?: DocumentMetadata;
  /**
   * List of all components in the document. This is the primary content of a GhJSON file.
   */
  components: ComponentData[];
  /**
   * List of all connections (wires) between component parameters.
   */
  connections?: ConnectionData[];
  /**
   * List of component groups for organization.
   */
  groups?: GroupData[];
}
/**
 * Optional document metadata including author, description, and version information.
 */
export interface DocumentMetadata {
  /**
   * The title of the definition.
   */
  title?: string;
  /**
   * A description of what this definition does.
   */
  description?: string;
  /**
   * Version of the definition itself (not the schema). On every save, the version should be incremented.
   */
  version?: string;
  /**
   * The author of this definition.
   */
  author?: string;
  /**
   * Creation timestamp in ISO 8601 format.
   */
  created?: string;
  /**
   * Last modification timestamp in ISO 8601 format.
   */
  modified?: string;
  /**
   * The Rhino version this definition was created with.
   */
  rhinoVersion?: string;
  /**
   * The Grasshopper version this definition was created with.
   */
  grasshopperVersion?: string;
  /**
   * List of tags for categorizing and searching definitions.
   */
  tags?: string[];
  /**
   * List of required plugin dependencies.
   */
  dependencies?: string[];
  /**
   * Total number of components in the document.
   */
  componentCount?: number;
  /**
   * Total number of connections in the document.
   */
  connectionCount?: number;
  /**
   * Total number of groups in the document.
   */
  groupCount?: number;
  /**
   * Pagination information when the document contains only a subset of components.
   */
  pagination?: {
    /**
     * One-based page index.
     */
    page?: number;
    /**
     * Number of components per page.
     */
    pageSize?: number;
    /**
     * Total number of pages available.
     */
    totalPages?: number;
  };
  /**
   * Name of the tool that generated this GhJSON file.
   */
  generatorName?: string;
  /**
   * Version of the tool that generated this file.
   */
  generatorVersion?: string;
  /**
   * Extension point for metadata produced by object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects.
   */
  extensions?: GhJSONExtensionRegistryV10;
}
/**
 * Schema for GhJSON extension containers. Known extension keys are validated against their official schemas. Unknown extension keys are allowed but must remain objects.
 */
export interface GhJSONExtensionRegistryV10 {
  "gh.button"?: GhJSONExtensionGhButtonV10;
  "gh.colorswatch"?: GhJSONExtensionGhColorswatchV10;
  "gh.csharp"?: GhJSONExtensionGhCsharpV10;
  "gh.filepath"?: GhJSONExtensionGhFilepathV10;
  "gh.ghpython"?: GhJSONExtensionGhGhpythonV10;
  "gh.ironpython"?: GhJSONExtensionGhIronpythonV10;
  "gh.numberslider"?: GhJSONExtensionGhNumbersliderV10;
  "gh.panel"?: GhJSONExtensionGhPanelV10;
  "gh.python"?: GhJSONExtensionGhPythonV10;
  "gh.scribble"?: GhJSONExtensionGhScribbleV10;
  "gh.toggle"?: GhJSONExtensionGhToggleV10;
  "gh.valuelist"?: GhJSONExtensionGhValuelistV10;
  "gh.vbscript"?: GhJSONExtensionGhVbscriptV10;
  "smarthopper.state"?: GhJSONExtensionSmarthopperStateV10;
  [k: string]:
    | {}
    | GhJSONExtensionGhButtonV10
    | GhJSONExtensionGhColorswatchV10
    | GhJSONExtensionGhCsharpV10
    | GhJSONExtensionGhFilepathV10
    | GhJSONExtensionGhGhpythonV10
    | GhJSONExtensionGhIronpythonV10
    | GhJSONExtensionGhNumbersliderV10
    | GhJSONExtensionGhPanelV10
    | GhJSONExtensionGhPythonV10
    | GhJSONExtensionGhScribbleV10
    | GhJSONExtensionGhToggleV10
    | GhJSONExtensionGhValuelistV10
    | GhJSONExtensionGhVbscriptV10
    | GhJSONExtensionSmarthopperStateV10
    | undefined;
}
/**
 * Extension for GH_ButtonObject component state
 */
export interface GhJSONExtensionGhButtonV10 {
  /**
   * Value when button is in normal state (default: 'False')
   */
  normal?: string;
  /**
   * Value when button is pressed (default: 'True')
   */
  pressed?: string;
}
/**
 * Extension for GH_ColourSwatch component state
 */
export interface GhJSONExtensionGhColorswatchV10 {
  /**
   * Color value in ARGB format (e.g., 'argb:255,150,144,53')
   */
  color: string;
}
/**
 * Extension for C# Script component state
 */
export interface GhJSONExtensionGhCsharpV10 {
  /**
   * C# script code
   */
  code: string;
  /**
   * Whether to show standard output parameter (default: true)
   */
  showStandardOutput?: boolean;
  /**
   * Avoid Marshalling Output Guids - true when enabled (default: false)
   */
  avoidMarshalGuids?: boolean;
  /**
   * Avoid Grafting Output Lines - true when enabled (default: false)
   */
  avoidGraftOutputs?: boolean;
  /**
   * Avoid Marshalling Inputs - true when enabled (default: false)
   */
  avoidMarshalInputs?: boolean;
  /**
   * Modifiers for the 'out' standard output parameter
   */
  outModifiers?: {
    /**
     * Simplify output data tree
     */
    isSimplified?: boolean;
    /**
     * Reverse output data tree
     */
    isReversed?: boolean;
    /**
     * Data mapping mode for output
     */
    dataMapping?: "none" | "flatten" | "graft";
    /**
     * Expression applied to the output
     */
    expression?: string;
  };
}
/**
 * Extension for the Grasshopper File Path floating parameter. Captures the file filter and behaviour flags so the component can be restored without relying on generic reflection-based state.
 */
export interface GhJSONExtensionGhFilepathV10 {
  /**
   * File picker filter string, e.g. 'All files|*.*' or 'JSON files|*.json'.
   */
  fileFilter?: string;
  /**
   * When true, the component expires its solution when the referenced file changes on disk.
   */
  expireOnFileEvent?: boolean;
}
/**
 * Extension for old GhPython script components (ZuiPythonComponent from GhPython.dll). Covers the generic GhPython Script component as well as Ladybug Tools, Honeybee, Dragonfly, and any other plugin that ships pre-configured ZuiPythonComponent instances. Unlike Rhino 8 script components (gh.csharp, gh.python, gh.ironpython) which implement IScriptComponent, old GhPython components do not expose that interface. Marshalling options are therefore not applicable.
 */
export interface GhJSONExtensionGhGhpythonV10 {
  /**
   * Python (IronPython) script code embedded in the component
   */
  code: string;
  /**
   * Whether to show the 'out' standard output parameter (default: true)
   */
  showStandardOutput?: boolean;
  /**
   * Modifiers for the 'out' standard output parameter
   */
  outModifiers?: {
    /**
     * Simplify output data tree
     */
    isSimplified?: boolean;
    /**
     * Reverse output data tree
     */
    isReversed?: boolean;
    /**
     * Data mapping mode for output
     */
    dataMapping?: "none" | "flatten" | "graft";
    /**
     * Expression applied to the output
     */
    expression?: string;
  };
}
/**
 * Extension for IronPython Script component state
 */
export interface GhJSONExtensionGhIronpythonV10 {
  /**
   * IronPython 2 script code
   */
  code: string;
  /**
   * Whether to show standard output parameter (default: true)
   */
  showStandardOutput?: boolean;
  /**
   * Avoid Marshalling Output Guids - true when enabled (default: false)
   */
  avoidMarshalGuids?: boolean;
  /**
   * Avoid Grafting Output Lines - true when enabled (default: false)
   */
  avoidGraftOutputs?: boolean;
  /**
   * Avoid Marshalling Inputs - true when enabled (default: false)
   */
  avoidMarshalInputs?: boolean;
  /**
   * Modifiers for the 'out' standard output parameter
   */
  outModifiers?: {
    /**
     * Simplify output data tree
     */
    isSimplified?: boolean;
    /**
     * Reverse output data tree
     */
    isReversed?: boolean;
    /**
     * Data mapping mode for output
     */
    dataMapping?: "none" | "flatten" | "graft";
    /**
     * Expression applied to the output
     */
    expression?: string;
  };
}
/**
 * Extension for GH_NumberSlider component state
 */
export interface GhJSONExtensionGhNumbersliderV10 {
  value?: string;
  rounding?: string;
}
/**
 * Extension for GH_Panel component state
 */
export interface GhJSONExtensionGhPanelV10 {
  /**
   * Panel text content
   */
  text?: string;
  /**
   * Whether text is multiline
   */
  multiline?: boolean;
  /**
   * Whether text wraps
   */
  wrap?: boolean;
  /**
   * Text alignment (Left, Center, Right)
   */
  alignment?: string;
  /**
   * Panel color as ARGB format (argb:0-255,0-255,0-255,0-255)
   */
  color?: string;
  /**
   * Panel bounds as WxH (width x height)
   */
  bounds?: string;
  /**
   * Whether to draw indices
   */
  drawIndices?: boolean;
  /**
   * Whether to draw paths
   */
  drawPaths?: boolean;
}
/**
 * Extension for Python Script component state
 */
export interface GhJSONExtensionGhPythonV10 {
  /**
   * Python 3 script code
   */
  code: string;
  /**
   * Whether to show standard output parameter (default: true)
   */
  showStandardOutput?: boolean;
  /**
   * Avoid Marshalling Output Guids - true when enabled (default: false)
   */
  avoidMarshalGuids?: boolean;
  /**
   * Avoid Grafting Output Lines - true when enabled (default: false)
   */
  avoidGraftOutputs?: boolean;
  /**
   * Avoid Marshalling Inputs - true when enabled (default: false)
   */
  avoidMarshalInputs?: boolean;
  /**
   * Modifiers for the 'out' standard output parameter
   */
  outModifiers?: {
    /**
     * Simplify output data tree
     */
    isSimplified?: boolean;
    /**
     * Reverse output data tree
     */
    isReversed?: boolean;
    /**
     * Data mapping mode for output
     */
    dataMapping?: "none" | "flatten" | "graft";
    /**
     * Expression applied to the output
     */
    expression?: string;
  };
}
/**
 * Extension for GH_Scribble component state. Corners A, B, D are stored as offsets relative to the component pivot. Corner C is derived as B + D - A (parallelogram rule).
 */
export interface GhJSONExtensionGhScribbleV10 {
  /**
   * Scribble text content
   */
  text?: string;
  /**
   * Three corner offsets relative to pivot as comma-separated x,y pairs: [A, B, D]. Corner C is derived as B + D - A.
   *
   * @minItems 3
   * @maxItems 3
   */
  corners?: [string, string, string];
  /**
   * Font family name
   */
  fontFamily?: string;
  /**
   * Font size in points
   */
  fontSize?: number;
  /**
   * Whether the font is bold
   */
  bold?: boolean;
  /**
   * Whether the font is italic
   */
  italic?: boolean;
}
/**
 * Extension for GH_BooleanToggle component state
 */
export interface GhJSONExtensionGhToggleV10 {
  /**
   * Current toggle state (true/false)
   */
  value: boolean;
}
/**
 * Extension for GH_ValueList component state
 */
export interface GhJSONExtensionGhValuelistV10 {
  /**
   * List mode (CheckList, DropDownList, RadioButtons, etc.)
   */
  listMode?: string;
  /**
   * List items with name, expression, and selection state
   */
  items?: {
    /**
     * Item display name
     */
    name: string;
    /**
     * Item expression/value
     */
    expression: string;
    /**
     * Whether item is selected
     */
    selected?: boolean;
  }[];
}
/**
 * Extension for VB.NET Script component state
 */
export interface GhJSONExtensionGhVbscriptV10 {
  /**
   * VB.NET script code sections
   */
  vbCode: {
    /**
     * Import statements section
     */
    imports?: string;
    /**
     * Main script code
     */
    script?: string;
    /**
     * Additional code section
     */
    additional?: string;
  };
  /**
   * Whether to show standard output parameter
   */
  showStandardOutput?: boolean;
}
/**
 * Extension for SmartHopper component state. Captures selected AI provider name and canvas selections.
 */
export interface GhJSONExtensionSmarthopperStateV10 {
  /**
   * Name of the selected AI provider (e.g. 'OpenAI', 'MistralAI'). Omit or use 'Default' to use the global default provider.
   */
  selectedProviderName?: string;
  /**
   * Component integer IDs of objects selected on the canvas by this component.
   *
   * Items: GhJSON component id
   */
  selectedObjects?: number[];
}
/**
 * Configuration for a component's input or output parameter.
 */
export interface ParameterSettings {
  /**
   * The name of the parameter.
   */
  parameterName: string;
  /**
   * Custom nickname for the parameter.
   */
  nickName?: string;
  /**
   * Custom variable name for the parameter. Used by script components.
   */
  variableName?: string;
  /**
   * Description of the parameter.
   */
  description?: string;
  /**
   * Data tree mapping mode.
   */
  dataMapping?: "none" | "flatten" | "graft";
  /**
   * Expression that transforms parameter data. The presence of this property implies the parameter has an expression.
   */
  expression?: string;
  /**
   * Data access mode for script parameters.
   */
  access?: "item" | "list" | "tree";
  /**
   * Type hint for script parameters (e.g., 'int', 'double', 'Point3d').
   */
  typeHint?: string;
  /**
   * Whether this is the principal (master) input parameter. Affects parameter matching behavior.
   */
  isPrincipal?: boolean;
  /**
   * Whether this parameter is required (cannot be removed). Applicable to variable parameter components.
   */
  isRequired?: boolean;
  /**
   * Whether the parameter domain is reparameterized.
   */
  isReparameterized?: boolean;
  /**
   * Whether to reverse the parameter data order.
   */
  isReversed?: boolean;
  /**
   * Whether to simplify the parameter data tree.
   */
  isSimplified?: boolean;
  /**
   * Whether to invert boolean values (Param_Boolean only).
   */
  isInverted?: boolean;
  /**
   * Whether to unitize vectors (Param_Vector only).
   */
  isUnitized?: boolean;
  /**
   * Internalized data for the parameter.
   */
  internalizedData?:
    | InternalizedDataTree
    | {
        value: InternalizedDataTree;
      };
  runtimeData?: InternalizedDataTree1;
}
/**
 * Internalized data tree. The first-level keys are Grasshopper paths (e.g., '{0}'). Each path maps to an object whose keys are item identifiers (e.g., '{0}(0)') and whose values are prefixed strings (e.g., 'text:hello').
 */
export interface InternalizedDataTree {
  [k: string]: {
    [k: string]: string;
  };
}
/**
 * Internalized data tree. The first-level keys are Grasshopper paths (e.g., '{0}'). Each path maps to an object whose keys are item identifiers (e.g., '{0}(0)') and whose values are prefixed strings (e.g., 'text:hello').
 */
export interface InternalizedDataTree1 {
  [k: string]: {
    [k: string]: string;
  };
}
/**
 * UI-specific state for the component.
 */
export interface ComponentState {
  /**
   * Whether the component is currently selected on the canvas.
   */
  selected?: boolean;
  /**
   * Whether the component is locked (disabled).
   */
  locked?: boolean;
  /**
   * Whether the component preview is hidden.
   */
  hidden?: boolean;
  /**
   * Extension point for future object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects.
   */
  extensions?: GhJSONExtensionRegistryV10;
  [k: string]: unknown;
}
/**
 * A connection (wire) between two component parameters.
 */
export interface ConnectionData {
  from: ConnectionEndpoint;
  to: ConnectionEndpoint1;
  /**
   * When true, one or both endpoints reference components that are not present in this document (e.g. because of pagination).
   */
  boundary?: boolean;
}

/** The vendored GhJSON JSON Schema (v1.0), embedded so consumers need no file access. */
export const ghJsonSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/ghjson.schema.json",
  "title": "GhJSON Document",
  "description": "GhJSON is a JSON-based format for representing Grasshopper definitions. It provides a human-readable, portable way to serialize and deserialize Grasshopper documents.",
  "type": "object",
  "required": [
    "components"
  ],
  "properties": {
    "schema": {
      "type": "string",
      "description": "The GhJSON schema version. Used for compatibility checking.",
      "pattern": "^\\d+\\.\\d+(\\.\\d+)?$",
      "default": "1.0",
      "examples": [
        "1.0",
        "1.1"
      ]
    },
    "metadata": {
      "$ref": "#/$defs/documentMetadata",
      "description": "Optional document metadata including author, description, and version information."
    },
    "components": {
      "type": "array",
      "description": "List of all components in the document. This is the primary content of a GhJSON file.",
      "items": {
        "$ref": "#/$defs/componentData"
      }
    },
    "connections": {
      "type": "array",
      "description": "List of all connections (wires) between component parameters.",
      "items": {
        "$ref": "#/$defs/connectionData"
      }
    },
    "groups": {
      "type": "array",
      "description": "List of component groups for organization.",
      "items": {
        "$ref": "#/$defs/groupData"
      }
    }
  },
  "additionalProperties": false,
  "$defs": {
    "documentMetadata": {
      "type": "object",
      "description": "Metadata about the Grasshopper document.",
      "properties": {
        "title": {
          "type": "string",
          "description": "The title of the definition."
        },
        "description": {
          "type": "string",
          "description": "A description of what this definition does."
        },
        "version": {
          "type": "string",
          "description": "Version of the definition itself (not the schema). On every save, the version should be incremented.",
          "examples": [
            "1",
            "2",
            "3"
          ],
          "pattern": "^\\d+$",
          "default": "1"
        },
        "author": {
          "type": "string",
          "description": "The author of this definition."
        },
        "created": {
          "type": "string",
          "format": "date-time",
          "description": "Creation timestamp in ISO 8601 format."
        },
        "modified": {
          "type": "string",
          "format": "date-time",
          "description": "Last modification timestamp in ISO 8601 format."
        },
        "rhinoVersion": {
          "type": "string",
          "description": "The Rhino version this definition was created with.",
          "examples": [
            "8.24",
            "7.12"
          ]
        },
        "grasshopperVersion": {
          "type": "string",
          "description": "The Grasshopper version this definition was created with."
        },
        "tags": {
          "type": "array",
          "description": "List of tags for categorizing and searching definitions.",
          "items": {
            "type": "string"
          }
        },
        "dependencies": {
          "type": "array",
          "description": "List of required plugin dependencies.",
          "items": {
            "type": "string"
          }
        },
        "componentCount": {
          "type": "integer",
          "description": "Total number of components in the document.",
          "minimum": 0
        },
        "connectionCount": {
          "type": "integer",
          "description": "Total number of connections in the document.",
          "minimum": 0
        },
        "groupCount": {
          "type": "integer",
          "description": "Total number of groups in the document.",
          "minimum": 0
        },
        "pagination": {
          "type": "object",
          "description": "Pagination information when the document contains only a subset of components.",
          "properties": {
            "page": {
              "type": "integer",
              "description": "One-based page index.",
              "minimum": 1
            },
            "pageSize": {
              "type": "integer",
              "description": "Number of components per page.",
              "minimum": 1
            },
            "totalPages": {
              "type": "integer",
              "description": "Total number of pages available.",
              "minimum": 1
            }
          },
          "additionalProperties": false
        },
        "generatorName": {
          "type": "string",
          "description": "Name of the tool that generated this GhJSON file."
        },
        "generatorVersion": {
          "type": "string",
          "description": "Version of the tool that generated this file."
        },
        "extensions": {
          "allOf": [
            {
              "$ref": "extensions/extensions.schema.json"
            }
          ],
          "description": "Extension point for metadata produced by object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects."
        }
      },
      "additionalProperties": false
    },
    "argbString": {
      "type": "string",
      "description": "ARGB color in prefixed format (e.g., 'argb:255,0,200,0').",
      "pattern": "^argb:(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    },
    "internalizedDataTree": {
      "type": "object",
      "description": "Internalized data tree. The first-level keys are Grasshopper paths (e.g., '{0}'). Each path maps to an object whose keys are item identifiers (e.g., '{0}(0)') and whose values are prefixed strings (e.g., 'text:hello').",
      "propertyNames": {
        "type": "string",
        "pattern": "^\\{.*\\}$"
      },
      "additionalProperties": {
        "type": "object",
        "additionalProperties": {
          "type": "string"
        }
      }
    },
    "componentData": {
      "type": "object",
      "description": "Represents a single Grasshopper component or floating parameter.",
      "anyOf": [
        {
          "required": [
            "name",
            "id"
          ]
        },
        {
          "required": [
            "name",
            "instanceGuid"
          ]
        },
        {
          "required": [
            "componentGuid",
            "id"
          ]
        },
        {
          "required": [
            "componentGuid",
            "instanceGuid"
          ]
        }
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the component. Must match the component's name in the Grasshopper library.",
          "examples": [
            "Addition",
            "Panel",
            "Number Slider",
            "C# Script"
          ]
        },
        "library": {
          "type": "string",
          "description": "The component library/category (e.g., 'Maths', 'Params')."
        },
        "nickName": {
          "type": "string",
          "description": "Custom nickname for the component."
        },
        "componentGuid": {
          "type": "string",
          "format": "uuid",
          "description": "The unique identifier for the component type. Used to instantiate the correct component class."
        },
        "instanceGuid": {
          "type": "string",
          "format": "uuid",
          "description": "The unique identifier for this specific component instance."
        },
        "id": {
          "type": "integer",
          "description": "Integer ID for compact reference in connections and groups. Must be unique within the document. Each instanceGuid is assigned a unique ID.",
          "minimum": 1
        },
        "pivot": {
          "description": "The position of a component on the Grasshopper canvas.",
          "anyOf": [
            {
              "type": "string",
              "description": "Compact format: 'X,Y' where X and Y are integers.",
              "pattern": "^-?\\d+,-?\\d+$",
              "examples": [
                "100,200",
                "-50,300"
              ]
            },
            {
              "type": "object",
              "description": "Object format with explicit x and y integer properties.",
              "required": [
                "x",
                "y"
              ],
              "properties": {
                "x": {
                  "type": "integer",
                  "description": "The X coordinate on the canvas."
                },
                "y": {
                  "type": "integer",
                  "description": "The Y coordinate on the canvas."
                }
              },
              "additionalProperties": false
            }
          ]
        },
        "inputSettings": {
          "type": "array",
          "description": "Configuration for input parameters.",
          "items": {
            "$ref": "#/$defs/parameterSettings"
          }
        },
        "outputSettings": {
          "type": "array",
          "description": "Configuration for output parameters.",
          "items": {
            "$ref": "#/$defs/parameterSettings"
          }
        },
        "componentState": {
          "$ref": "#/$defs/componentState",
          "description": "UI-specific state for the component."
        },
        "errors": {
          "type": "array",
          "description": "List of error messages associated with the component.",
          "items": {
            "type": "string"
          }
        },
        "warnings": {
          "type": "array",
          "description": "List of warning messages associated with the component.",
          "items": {
            "type": "string"
          }
        },
        "remarks": {
          "type": "array",
          "description": "List of remarks associated with the component.",
          "items": {
            "type": "string"
          }
        }
      },
      "additionalProperties": false
    },
    "parameterSettings": {
      "type": "object",
      "description": "Configuration for a component's input or output parameter.",
      "required": [
        "parameterName"
      ],
      "properties": {
        "parameterName": {
          "type": "string",
          "description": "The name of the parameter."
        },
        "nickName": {
          "type": "string",
          "description": "Custom nickname for the parameter."
        },
        "variableName": {
          "type": "string",
          "description": "Custom variable name for the parameter. Used by script components."
        },
        "description": {
          "type": "string",
          "description": "Description of the parameter."
        },
        "dataMapping": {
          "type": "string",
          "description": "Data tree mapping mode.",
          "enum": [
            "none",
            "flatten",
            "graft"
          ]
        },
        "expression": {
          "type": "string",
          "description": "Expression that transforms parameter data. The presence of this property implies the parameter has an expression."
        },
        "access": {
          "type": "string",
          "description": "Data access mode for script parameters.",
          "enum": [
            "item",
            "list",
            "tree"
          ]
        },
        "typeHint": {
          "type": "string",
          "description": "Type hint for script parameters (e.g., 'int', 'double', 'Point3d')."
        },
        "isPrincipal": {
          "type": "boolean",
          "description": "Whether this is the principal (master) input parameter. Affects parameter matching behavior."
        },
        "isRequired": {
          "type": "boolean",
          "description": "Whether this parameter is required (cannot be removed). Applicable to variable parameter components."
        },
        "isReparameterized": {
          "type": "boolean",
          "description": "Whether the parameter domain is reparameterized."
        },
        "isReversed": {
          "type": "boolean",
          "description": "Whether to reverse the parameter data order."
        },
        "isSimplified": {
          "type": "boolean",
          "description": "Whether to simplify the parameter data tree."
        },
        "isInverted": {
          "type": "boolean",
          "description": "Whether to invert boolean values (Param_Boolean only)."
        },
        "isUnitized": {
          "type": "boolean",
          "description": "Whether to unitize vectors (Param_Vector only)."
        },
        "internalizedData": {
          "description": "Internalized data for the parameter.",
          "anyOf": [
            {
              "$ref": "#/$defs/internalizedDataTree"
            },
            {
              "type": "object",
              "properties": {
                "value": {
                  "$ref": "#/$defs/internalizedDataTree"
                }
              },
              "required": [
                "value"
              ],
              "additionalProperties": false
            }
          ]
        },
        "runtimeData": {
          "$ref": "#/$defs/internalizedDataTree",
          "description": "Runtime (volatile) data for the parameter."
        }
      },
      "additionalProperties": false
    },
    "componentState": {
      "type": "object",
      "description": "UI-specific state for components. The properties used depend on the component type.",
      "properties": {
        "selected": {
          "type": "boolean",
          "description": "Whether the component is currently selected on the canvas."
        },
        "locked": {
          "type": "boolean",
          "description": "Whether the component is locked (disabled)."
        },
        "hidden": {
          "type": "boolean",
          "description": "Whether the component preview is hidden."
        },
        "extensions": {
          "allOf": [
            {
              "$ref": "extensions/extensions.schema.json"
            }
          ],
          "description": "Extension point for future object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects."
        }
      },
      "additionalProperties": true
    },
    "connectionData": {
      "type": "object",
      "description": "A connection (wire) between two component parameters.",
      "required": [
        "from",
        "to"
      ],
      "properties": {
        "from": {
          "$ref": "#/$defs/connectionEndpoint",
          "description": "The source endpoint (output parameter)."
        },
        "to": {
          "$ref": "#/$defs/connectionEndpoint",
          "description": "The target endpoint (input parameter)."
        },
        "boundary": {
          "type": "boolean",
          "description": "When true, one or both endpoints reference components that are not present in this document (e.g. because of pagination)."
        }
      },
      "additionalProperties": false
    },
    "connectionEndpoint": {
      "type": "object",
      "description": "An endpoint of a connection, referencing a component parameter.",
      "anyOf": [
        {
          "required": [
            "id",
            "paramName"
          ]
        },
        {
          "required": [
            "id",
            "paramIndex"
          ]
        }
      ],
      "properties": {
        "id": {
          "type": "integer",
          "description": "The integer ID of the component.",
          "minimum": 1
        },
        "paramName": {
          "type": "string",
          "description": "The name of the parameter on the component."
        },
        "paramIndex": {
          "type": "integer",
          "description": "The zero-based index of the parameter. Used for reliable matching regardless of display name settings.",
          "minimum": 0
        }
      },
      "additionalProperties": false
    },
    "groupData": {
      "type": "object",
      "description": "A Grasshopper group containing multiple components.",
      "anyOf": [
        {
          "required": [
            "instanceGuid",
            "members"
          ]
        },
        {
          "required": [
            "id",
            "members"
          ]
        }
      ],
      "properties": {
        "instanceGuid": {
          "type": "string",
          "format": "uuid",
          "description": "The unique identifier for this group instance."
        },
        "id": {
          "type": "integer",
          "description": "The integer ID of the group. Must be unique within the file."
        },
        "name": {
          "type": "string",
          "description": "The name of the group."
        },
        "color": {
          "description": "The group color in ARGB format (e.g., 'argb:255,0,200,0').",
          "$ref": "#/$defs/argbString"
        },
        "members": {
          "type": "array",
          "description": "List of component integer IDs that belong to this group.",
          "items": {
            "type": "integer",
            "minimum": 1
          }
        }
      },
      "additionalProperties": false
    }
  }
} as const

/**
 * Every vendored schema file keyed by its $id (extension schemas included —
 * ajv resolves cross-file $refs by $id when they are all registered).
 */
export const ghJsonSchemaSet: ReadonlyArray<Record<string, unknown>> = [{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/extensions.schema.json","title":"GhJSON Extension Registry (v1.0)","description":"Schema for GhJSON extension containers. Known extension keys are validated against their official schemas. Unknown extension keys are allowed but must remain objects.","type":"object","properties":{"gh.button":{"$ref":"./gh.button.schema.json"},"gh.colorswatch":{"$ref":"./gh.colorswatch.schema.json"},"gh.csharp":{"$ref":"./gh.csharp.schema.json"},"gh.filepath":{"$ref":"./gh.filepath.schema.json"},"gh.ghpython":{"$ref":"./gh.ghpython.schema.json"},"gh.ironpython":{"$ref":"./gh.ironpython.schema.json"},"gh.numberslider":{"$ref":"./gh.numberslider.schema.json"},"gh.panel":{"$ref":"./gh.panel.schema.json"},"gh.python":{"$ref":"./gh.python.schema.json"},"gh.scribble":{"$ref":"./gh.scribble.schema.json"},"gh.toggle":{"$ref":"./gh.toggle.schema.json"},"gh.valuelist":{"$ref":"./gh.valuelist.schema.json"},"gh.vbscript":{"$ref":"./gh.vbscript.schema.json"},"smarthopper.state":{"$ref":"./smarthopper.state.schema.json"}},"additionalProperties":{"type":"object"}},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.button.schema.json","title":"GhJSON Extension: gh.button (v1.0)","description":"Extension for GH_ButtonObject component state","type":"object","properties":{"normal":{"type":"string","description":"Value when button is in normal state (default: 'False')"},"pressed":{"type":"string","description":"Value when button is pressed (default: 'True')"}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.colorswatch.schema.json","title":"GhJSON Extension: gh.colorswatch (v1.0)","description":"Extension for GH_ColourSwatch component state","type":"object","properties":{"color":{"type":"string","description":"Color value in ARGB format (e.g., 'argb:255,150,144,53')"}},"required":["color"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.csharp.schema.json","title":"GhJSON Extension: gh.csharp (v1.0)","description":"Extension for C# Script component state","type":"object","properties":{"code":{"type":"string","description":"C# script code"},"showStandardOutput":{"type":"boolean","description":"Whether to show standard output parameter (default: true)"},"avoidMarshalGuids":{"type":"boolean","description":"Avoid Marshalling Output Guids - true when enabled (default: false)"},"avoidGraftOutputs":{"type":"boolean","description":"Avoid Grafting Output Lines - true when enabled (default: false)"},"avoidMarshalInputs":{"type":"boolean","description":"Avoid Marshalling Inputs - true when enabled (default: false)"},"outModifiers":{"type":"object","description":"Modifiers for the 'out' standard output parameter","properties":{"isSimplified":{"type":"boolean","description":"Simplify output data tree"},"isReversed":{"type":"boolean","description":"Reverse output data tree"},"dataMapping":{"type":"string","enum":["none","flatten","graft"],"description":"Data mapping mode for output"},"expression":{"type":"string","description":"Expression applied to the output"}},"additionalProperties":false}},"required":["code"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.filepath.schema.json","title":"GhJSON Extension: gh.filepath (v1.0)","description":"Extension for the Grasshopper File Path floating parameter. Captures the file filter and behaviour flags so the component can be restored without relying on generic reflection-based state.","type":"object","properties":{"fileFilter":{"type":"string","description":"File picker filter string, e.g. 'All files|*.*' or 'JSON files|*.json'."},"expireOnFileEvent":{"type":"boolean","description":"When true, the component expires its solution when the referenced file changes on disk."}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.ghpython.schema.json","title":"GhJSON Extension: gh.ghpython (v1.0)","description":"Extension for old GhPython script components (ZuiPythonComponent from GhPython.dll). Covers the generic GhPython Script component as well as Ladybug Tools, Honeybee, Dragonfly, and any other plugin that ships pre-configured ZuiPythonComponent instances. Unlike Rhino 8 script components (gh.csharp, gh.python, gh.ironpython) which implement IScriptComponent, old GhPython components do not expose that interface. Marshalling options are therefore not applicable.","type":"object","properties":{"code":{"type":"string","description":"Python (IronPython) script code embedded in the component"},"showStandardOutput":{"type":"boolean","description":"Whether to show the 'out' standard output parameter (default: true)"},"outModifiers":{"type":"object","description":"Modifiers for the 'out' standard output parameter","properties":{"isSimplified":{"type":"boolean","description":"Simplify output data tree"},"isReversed":{"type":"boolean","description":"Reverse output data tree"},"dataMapping":{"type":"string","enum":["none","flatten","graft"],"description":"Data mapping mode for output"},"expression":{"type":"string","description":"Expression applied to the output"}},"additionalProperties":false}},"required":["code"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.ironpython.schema.json","title":"GhJSON Extension: gh.ironpython (v1.0)","description":"Extension for IronPython Script component state","type":"object","properties":{"code":{"type":"string","description":"IronPython 2 script code"},"showStandardOutput":{"type":"boolean","description":"Whether to show standard output parameter (default: true)"},"avoidMarshalGuids":{"type":"boolean","description":"Avoid Marshalling Output Guids - true when enabled (default: false)"},"avoidGraftOutputs":{"type":"boolean","description":"Avoid Grafting Output Lines - true when enabled (default: false)"},"avoidMarshalInputs":{"type":"boolean","description":"Avoid Marshalling Inputs - true when enabled (default: false)"},"outModifiers":{"type":"object","description":"Modifiers for the 'out' standard output parameter","properties":{"isSimplified":{"type":"boolean","description":"Simplify output data tree"},"isReversed":{"type":"boolean","description":"Reverse output data tree"},"dataMapping":{"type":"string","enum":["none","flatten","graft"],"description":"Data mapping mode for output"},"expression":{"type":"string","description":"Expression applied to the output"}},"additionalProperties":false}},"required":["code"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.numberslider.schema.json","title":"GhJSON Extension: gh.numberslider (v1.0)","description":"Extension for GH_NumberSlider component state","type":"object","properties":{"value":{"type":"string"},"rounding":{"type":"string"}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.panel.schema.json","title":"GhJSON Extension: gh.panel (v1.0)","description":"Extension for GH_Panel component state","type":"object","properties":{"text":{"type":"string","description":"Panel text content"},"multiline":{"type":"boolean","description":"Whether text is multiline"},"wrap":{"type":"boolean","description":"Whether text wraps"},"alignment":{"type":"string","description":"Text alignment (Left, Center, Right)"},"color":{"type":"string","description":"Panel color as ARGB format (argb:0-255,0-255,0-255,0-255)"},"bounds":{"type":"string","pattern":"^\\d+x\\d+$","description":"Panel bounds as WxH (width x height)","examples":["50x40"]},"drawIndices":{"type":"boolean","description":"Whether to draw indices"},"drawPaths":{"type":"boolean","description":"Whether to draw paths"}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.python.schema.json","title":"GhJSON Extension: gh.python (v1.0)","description":"Extension for Python Script component state","type":"object","properties":{"code":{"type":"string","description":"Python 3 script code"},"showStandardOutput":{"type":"boolean","description":"Whether to show standard output parameter (default: true)"},"avoidMarshalGuids":{"type":"boolean","description":"Avoid Marshalling Output Guids - true when enabled (default: false)"},"avoidGraftOutputs":{"type":"boolean","description":"Avoid Grafting Output Lines - true when enabled (default: false)"},"avoidMarshalInputs":{"type":"boolean","description":"Avoid Marshalling Inputs - true when enabled (default: false)"},"outModifiers":{"type":"object","description":"Modifiers for the 'out' standard output parameter","properties":{"isSimplified":{"type":"boolean","description":"Simplify output data tree"},"isReversed":{"type":"boolean","description":"Reverse output data tree"},"dataMapping":{"type":"string","enum":["none","flatten","graft"],"description":"Data mapping mode for output"},"expression":{"type":"string","description":"Expression applied to the output"}},"additionalProperties":false}},"required":["code"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.scribble.schema.json","title":"GhJSON Extension: gh.scribble (v1.0)","description":"Extension for GH_Scribble component state. Corners A, B, D are stored as offsets relative to the component pivot. Corner C is derived as B + D - A (parallelogram rule).","type":"object","properties":{"text":{"type":"string","description":"Scribble text content"},"corners":{"type":"array","description":"Three corner offsets relative to pivot as comma-separated x,y pairs: [A, B, D]. Corner C is derived as B + D - A.","items":{"type":"string"},"minItems":3,"maxItems":3},"fontFamily":{"type":"string","description":"Font family name"},"fontSize":{"type":"number","description":"Font size in points"},"bold":{"type":"boolean","description":"Whether the font is bold"},"italic":{"type":"boolean","description":"Whether the font is italic"}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.toggle.schema.json","title":"GhJSON Extension: gh.toggle (v1.0)","description":"Extension for GH_BooleanToggle component state","type":"object","properties":{"value":{"type":"boolean","description":"Current toggle state (true/false)"}},"required":["value"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.valuelist.schema.json","title":"GhJSON Extension: gh.valuelist (v1.0)","description":"Extension for GH_ValueList component state","type":"object","properties":{"listMode":{"type":"string","description":"List mode (CheckList, DropDownList, RadioButtons, etc.)"},"items":{"type":"array","description":"List items with name, expression, and selection state","items":{"type":"object","properties":{"name":{"type":"string","description":"Item display name"},"expression":{"type":"string","description":"Item expression/value"},"selected":{"type":"boolean","description":"Whether item is selected"}},"required":["name","expression"],"additionalProperties":false}}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/gh.vbscript.schema.json","title":"GhJSON Extension: gh.vbscript (v1.0)","description":"Extension for VB.NET Script component state","type":"object","properties":{"vbCode":{"type":"object","description":"VB.NET script code sections","properties":{"imports":{"type":"string","description":"Import statements section"},"script":{"type":"string","description":"Main script code"},"additional":{"type":"string","description":"Additional code section"}},"additionalProperties":false},"showStandardOutput":{"type":"boolean","description":"Whether to show standard output parameter"}},"required":["vbCode"],"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/extensions/smarthopper.state.schema.json","title":"GhJSON Extension: smarthopper.state (v1.0)","description":"Extension for SmartHopper component state. Captures selected AI provider name and canvas selections.","type":"object","properties":{"selectedProviderName":{"type":"string","description":"Name of the selected AI provider (e.g. 'OpenAI', 'MistralAI'). Omit or use 'Default' to use the global default provider."},"selectedObjects":{"type":"array","description":"Component integer IDs of objects selected on the canvas by this component.","items":{"type":"integer","description":"GhJSON component id"}}},"additionalProperties":false},{"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://architects-toolkit.github.io/ghjson-spec/schema/v1.0/ghjson.schema.json","title":"GhJSON Document","description":"GhJSON is a JSON-based format for representing Grasshopper definitions. It provides a human-readable, portable way to serialize and deserialize Grasshopper documents.","type":"object","required":["components"],"properties":{"schema":{"type":"string","description":"The GhJSON schema version. Used for compatibility checking.","pattern":"^\\d+\\.\\d+(\\.\\d+)?$","default":"1.0","examples":["1.0","1.1"]},"metadata":{"$ref":"#/$defs/documentMetadata","description":"Optional document metadata including author, description, and version information."},"components":{"type":"array","description":"List of all components in the document. This is the primary content of a GhJSON file.","items":{"$ref":"#/$defs/componentData"}},"connections":{"type":"array","description":"List of all connections (wires) between component parameters.","items":{"$ref":"#/$defs/connectionData"}},"groups":{"type":"array","description":"List of component groups for organization.","items":{"$ref":"#/$defs/groupData"}}},"additionalProperties":false,"$defs":{"documentMetadata":{"type":"object","description":"Metadata about the Grasshopper document.","properties":{"title":{"type":"string","description":"The title of the definition."},"description":{"type":"string","description":"A description of what this definition does."},"version":{"type":"string","description":"Version of the definition itself (not the schema). On every save, the version should be incremented.","examples":["1","2","3"],"pattern":"^\\d+$","default":"1"},"author":{"type":"string","description":"The author of this definition."},"created":{"type":"string","format":"date-time","description":"Creation timestamp in ISO 8601 format."},"modified":{"type":"string","format":"date-time","description":"Last modification timestamp in ISO 8601 format."},"rhinoVersion":{"type":"string","description":"The Rhino version this definition was created with.","examples":["8.24","7.12"]},"grasshopperVersion":{"type":"string","description":"The Grasshopper version this definition was created with."},"tags":{"type":"array","description":"List of tags for categorizing and searching definitions.","items":{"type":"string"}},"dependencies":{"type":"array","description":"List of required plugin dependencies.","items":{"type":"string"}},"componentCount":{"type":"integer","description":"Total number of components in the document.","minimum":0},"connectionCount":{"type":"integer","description":"Total number of connections in the document.","minimum":0},"groupCount":{"type":"integer","description":"Total number of groups in the document.","minimum":0},"pagination":{"type":"object","description":"Pagination information when the document contains only a subset of components.","properties":{"page":{"type":"integer","description":"One-based page index.","minimum":1},"pageSize":{"type":"integer","description":"Number of components per page.","minimum":1},"totalPages":{"type":"integer","description":"Total number of pages available.","minimum":1}},"additionalProperties":false},"generatorName":{"type":"string","description":"Name of the tool that generated this GhJSON file."},"generatorVersion":{"type":"string","description":"Version of the tool that generated this file."},"extensions":{"allOf":[{"$ref":"extensions/extensions.schema.json"}],"description":"Extension point for metadata produced by object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects."}},"additionalProperties":false},"argbString":{"type":"string","description":"ARGB color in prefixed format (e.g., 'argb:255,0,200,0').","pattern":"^argb:(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]),(?:[0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"},"internalizedDataTree":{"type":"object","description":"Internalized data tree. The first-level keys are Grasshopper paths (e.g., '{0}'). Each path maps to an object whose keys are item identifiers (e.g., '{0}(0)') and whose values are prefixed strings (e.g., 'text:hello').","propertyNames":{"type":"string","pattern":"^\\{.*\\}$"},"additionalProperties":{"type":"object","additionalProperties":{"type":"string"}}},"componentData":{"type":"object","description":"Represents a single Grasshopper component or floating parameter.","anyOf":[{"required":["name","id"]},{"required":["name","instanceGuid"]},{"required":["componentGuid","id"]},{"required":["componentGuid","instanceGuid"]}],"properties":{"name":{"type":"string","description":"The name of the component. Must match the component's name in the Grasshopper library.","examples":["Addition","Panel","Number Slider","C# Script"]},"library":{"type":"string","description":"The component library/category (e.g., 'Maths', 'Params')."},"nickName":{"type":"string","description":"Custom nickname for the component."},"componentGuid":{"type":"string","format":"uuid","description":"The unique identifier for the component type. Used to instantiate the correct component class."},"instanceGuid":{"type":"string","format":"uuid","description":"The unique identifier for this specific component instance."},"id":{"type":"integer","description":"Integer ID for compact reference in connections and groups. Must be unique within the document. Each instanceGuid is assigned a unique ID.","minimum":1},"pivot":{"description":"The position of a component on the Grasshopper canvas.","anyOf":[{"type":"string","description":"Compact format: 'X,Y' where X and Y are integers.","pattern":"^-?\\d+,-?\\d+$","examples":["100,200","-50,300"]},{"type":"object","description":"Object format with explicit x and y integer properties.","required":["x","y"],"properties":{"x":{"type":"integer","description":"The X coordinate on the canvas."},"y":{"type":"integer","description":"The Y coordinate on the canvas."}},"additionalProperties":false}]},"inputSettings":{"type":"array","description":"Configuration for input parameters.","items":{"$ref":"#/$defs/parameterSettings"}},"outputSettings":{"type":"array","description":"Configuration for output parameters.","items":{"$ref":"#/$defs/parameterSettings"}},"componentState":{"$ref":"#/$defs/componentState","description":"UI-specific state for the component."},"errors":{"type":"array","description":"List of error messages associated with the component.","items":{"type":"string"}},"warnings":{"type":"array","description":"List of warning messages associated with the component.","items":{"type":"string"}},"remarks":{"type":"array","description":"List of remarks associated with the component.","items":{"type":"string"}}},"additionalProperties":false},"parameterSettings":{"type":"object","description":"Configuration for a component's input or output parameter.","required":["parameterName"],"properties":{"parameterName":{"type":"string","description":"The name of the parameter."},"nickName":{"type":"string","description":"Custom nickname for the parameter."},"variableName":{"type":"string","description":"Custom variable name for the parameter. Used by script components."},"description":{"type":"string","description":"Description of the parameter."},"dataMapping":{"type":"string","description":"Data tree mapping mode.","enum":["none","flatten","graft"]},"expression":{"type":"string","description":"Expression that transforms parameter data. The presence of this property implies the parameter has an expression."},"access":{"type":"string","description":"Data access mode for script parameters.","enum":["item","list","tree"]},"typeHint":{"type":"string","description":"Type hint for script parameters (e.g., 'int', 'double', 'Point3d')."},"isPrincipal":{"type":"boolean","description":"Whether this is the principal (master) input parameter. Affects parameter matching behavior."},"isRequired":{"type":"boolean","description":"Whether this parameter is required (cannot be removed). Applicable to variable parameter components."},"isReparameterized":{"type":"boolean","description":"Whether the parameter domain is reparameterized."},"isReversed":{"type":"boolean","description":"Whether to reverse the parameter data order."},"isSimplified":{"type":"boolean","description":"Whether to simplify the parameter data tree."},"isInverted":{"type":"boolean","description":"Whether to invert boolean values (Param_Boolean only)."},"isUnitized":{"type":"boolean","description":"Whether to unitize vectors (Param_Vector only)."},"internalizedData":{"description":"Internalized data for the parameter.","anyOf":[{"$ref":"#/$defs/internalizedDataTree"},{"type":"object","properties":{"value":{"$ref":"#/$defs/internalizedDataTree"}},"required":["value"],"additionalProperties":false}]},"runtimeData":{"$ref":"#/$defs/internalizedDataTree","description":"Runtime (volatile) data for the parameter."}},"additionalProperties":false},"componentState":{"type":"object","description":"UI-specific state for components. The properties used depend on the component type.","properties":{"selected":{"type":"boolean","description":"Whether the component is currently selected on the canvas."},"locked":{"type":"boolean","description":"Whether the component is locked (disabled)."},"hidden":{"type":"boolean","description":"Whether the component preview is hidden."},"extensions":{"allOf":[{"$ref":"extensions/extensions.schema.json"}],"description":"Extension point for future object handlers. Known extension keys MAY be validated against official extension schemas. Unknown keys are allowed but values MUST be objects."}},"additionalProperties":true},"connectionData":{"type":"object","description":"A connection (wire) between two component parameters.","required":["from","to"],"properties":{"from":{"$ref":"#/$defs/connectionEndpoint","description":"The source endpoint (output parameter)."},"to":{"$ref":"#/$defs/connectionEndpoint","description":"The target endpoint (input parameter)."},"boundary":{"type":"boolean","description":"When true, one or both endpoints reference components that are not present in this document (e.g. because of pagination)."}},"additionalProperties":false},"connectionEndpoint":{"type":"object","description":"An endpoint of a connection, referencing a component parameter.","anyOf":[{"required":["id","paramName"]},{"required":["id","paramIndex"]}],"properties":{"id":{"type":"integer","description":"The integer ID of the component.","minimum":1},"paramName":{"type":"string","description":"The name of the parameter on the component."},"paramIndex":{"type":"integer","description":"The zero-based index of the parameter. Used for reliable matching regardless of display name settings.","minimum":0}},"additionalProperties":false},"groupData":{"type":"object","description":"A Grasshopper group containing multiple components.","anyOf":[{"required":["instanceGuid","members"]},{"required":["id","members"]}],"properties":{"instanceGuid":{"type":"string","format":"uuid","description":"The unique identifier for this group instance."},"id":{"type":"integer","description":"The integer ID of the group. Must be unique within the file."},"name":{"type":"string","description":"The name of the group."},"color":{"description":"The group color in ARGB format (e.g., 'argb:255,0,200,0').","$ref":"#/$defs/argbString"},"members":{"type":"array","description":"List of component integer IDs that belong to this group.","items":{"type":"integer","minimum":1}}},"additionalProperties":false}}}] as const
