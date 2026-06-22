type Scheme = {
    readonly kind: 'complementary';
} | {
    readonly kind: 'split_complementary';
    readonly angle: number;
} | {
    readonly kind: 'triadic';
} | {
    readonly kind: 'tetradic';
} | {
    readonly kind: 'analogous';
    readonly angle: number;
    readonly count: number;
} | {
    readonly kind: 'monochromatic';
} | {
    readonly kind: 'custom';
    readonly offsets: readonly number[];
};
type SchemeKind = Scheme['kind'];

declare function harmonic_hues(base: number, scheme: Scheme): number[];

type TypeRef = {
    readonly _t: 'Number';
} | {
    readonly _t: 'Boolean';
} | {
    readonly _t: 'Ratio';
} | {
    readonly _t: 'Hue';
} | {
    readonly _t: 'Step';
} | {
    readonly _t: 'Curve';
} | {
    readonly _t: 'Scheme';
} | {
    readonly _t: 'Length';
    readonly unit: string;
} | {
    readonly _t: 'Angle';
    readonly unit: string;
} | {
    readonly _t: 'Time';
    readonly unit: string;
} | {
    readonly _t: 'Color';
    readonly space: string;
} | {
    readonly _t: 'Palette';
    readonly space: string;
} | {
    readonly _t: 'Tag';
    readonly domain: string;
} | {
    readonly _t: 'Var';
    readonly id: string;
};
declare function type_ref_eq(a: TypeRef, b: TypeRef): boolean;
type TonePointRaw = {
    readonly tone: number;
    readonly coords: readonly [number, number, number];
};
type PrimitiveValue = {
    readonly _t: 'Number';
    readonly v: number;
} | {
    readonly _t: 'Boolean';
    readonly v: boolean;
} | {
    readonly _t: 'Ratio';
    readonly v: number;
} | {
    readonly _t: 'Hue';
    readonly degrees: number;
} | {
    readonly _t: 'Step';
    readonly n: number;
} | {
    readonly _t: 'Color';
    readonly coords: readonly [number, number, number];
    readonly space: string;
} | {
    readonly _t: 'Tag';
    readonly domain: string;
    readonly v: string;
} | {
    readonly _t: 'Length';
    readonly magnitude: number;
    readonly unit: string;
} | {
    readonly _t: 'Angle';
    readonly magnitude: number;
    readonly unit: string;
} | {
    readonly _t: 'Time';
    readonly magnitude: number;
    readonly unit: string;
} | {
    readonly _t: 'Palette';
    readonly source_hue: number;
    readonly source_chroma: number;
    readonly space: string;
    readonly tones: readonly TonePointRaw[];
} | {
    readonly _t: 'Scheme';
    readonly kind: string;
};
type ContextQuery = {
    readonly kind: 'viewport_size';
    readonly axis: 'inline' | 'block' | 'width' | 'height';
} | {
    readonly kind: 'container_size';
    readonly axis: 'inline' | 'block' | 'width' | 'height';
} | {
    readonly kind: 'font_size';
    readonly scope: 'current' | 'root';
} | {
    readonly kind: 'theme';
    readonly which: 'name';
} | {
    readonly kind: 'density';
} | {
    readonly kind: 'reduced_motion';
} | {
    readonly kind: 'high_contrast';
} | {
    readonly kind: 'color_scheme';
};
type SourceRef = {
    readonly file?: string;
    readonly line?: number;
    readonly col?: number;
};
type IRNodeBase = {
    readonly kind: string;
    readonly type: TypeRef;
    readonly origin?: SourceRef;
    readonly attrs?: Readonly<Record<string, unknown>>;
};
type LitNode<T> = IRNodeBase & {
    readonly kind: 'lit';
    readonly value: PrimitiveValue;
    readonly _type_phantom?: T;
};
type ParamNode<T> = IRNodeBase & {
    readonly kind: 'param';
    readonly name: string;
    readonly default?: Expr<T>;
    readonly _type_phantom?: T;
};
type Binding = {
    readonly name: string;
    readonly type: TypeRef;
    readonly value: Expr<unknown>;
};
type LetNode<T> = IRNodeBase & {
    readonly kind: 'let';
    readonly bindings: readonly Binding[];
    readonly body: Expr<T>;
};
type OpNode<T> = IRNodeBase & {
    readonly kind: 'op';
    readonly op: string;
    readonly args: readonly Expr<unknown>[];
    readonly opts?: Readonly<Record<string, Expr<unknown>>>;
    readonly _type_phantom?: T;
};
type IfNode<T> = IRNodeBase & {
    readonly kind: 'if';
    readonly cond: Expr<boolean>;
    readonly then: Expr<T>;
    readonly else_: Expr<T>;
};
type SeqNode<T> = IRNodeBase & {
    readonly kind: 'seq';
    readonly exprs: readonly Expr<unknown>[];
    readonly _type_phantom?: T;
};
type CtxQueryNode<T> = IRNodeBase & {
    readonly kind: 'ctx_query';
    readonly query: ContextQuery;
    readonly _type_phantom?: T;
};
type TargetHintNode<T> = IRNodeBase & {
    readonly kind: 'target_hint';
    readonly target: string;
    readonly hint: Readonly<Record<string, unknown>>;
    readonly inner: Expr<T>;
};
type CommentNode<T> = IRNodeBase & {
    readonly kind: 'comment';
    readonly doc: string;
    readonly inner: Expr<T>;
};
type Expr<T> = LitNode<T> | ParamNode<T> | LetNode<T> | OpNode<T> | IfNode<T> | SeqNode<T> | CtxQueryNode<T> | TargetHintNode<T> | CommentNode<T>;
declare function is_lit<T>(n: Expr<T>): n is LitNode<T>;
declare function is_param<T>(n: Expr<T>): n is ParamNode<T>;
declare function is_op<T>(n: Expr<T>): n is OpNode<T>;
declare function is_if<T>(n: Expr<T>): n is IfNode<T>;
declare function is_let<T>(n: Expr<T>): n is LetNode<T>;
declare function is_ctx_query<T>(n: Expr<T>): n is CtxQueryNode<T>;

declare const COLOR_SPACES: readonly ["OKLCH", "OKLab", "HCT", "LCh", "Lab", "sRGB", "LinearRGB", "P3", "XYZ"];
type ColorSpace = (typeof COLOR_SPACES)[number];
declare function is_color_space(s: unknown): s is ColorSpace;

type Color<S extends ColorSpace> = {
    readonly coords: readonly [number, number, number];
    readonly space: S;
} & {
    readonly __brand: 'Color';
};
declare function make_color<S extends ColorSpace>(coords: readonly [number, number, number], space: S): Color<S>;

type PaletteName = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutral_variant' | 'error';
type M3Role = 'primary' | 'on_primary' | 'primary_container' | 'on_primary_container' | 'secondary' | 'on_secondary' | 'secondary_container' | 'on_secondary_container' | 'tertiary' | 'on_tertiary' | 'tertiary_container' | 'on_tertiary_container' | 'error' | 'on_error' | 'error_container' | 'on_error_container' | 'background' | 'on_background' | 'surface' | 'on_surface' | 'surface_variant' | 'on_surface_variant' | 'outline' | 'outline_variant';
type RoleDef = {
    readonly palette: PaletteName;
    readonly light_tone: number;
    readonly dark_tone: number;
};
declare const M3_ROLES: Readonly<Record<M3Role, RoleDef>>;
declare function lookup_role(role: M3Role): RoleDef;

type Hue = number & {
    readonly __brand: 'Hue';
};
declare function make_hue(degrees: number): Hue;
declare function hue_diff(a: Hue, b: Hue): number;

type TonePoint<S extends ColorSpace> = {
    readonly tone: number;
    readonly color: Color<S>;
};
type Palette<S extends ColorSpace> = {
    readonly space: S;
    readonly source_hue: Hue;
    readonly source_chroma: number;
    readonly tones: readonly TonePoint<S>[];
    readonly name?: string;
};

type SchemeTonalSpot = {
    readonly primary: Palette<'HCT'>;
    readonly secondary: Palette<'HCT'>;
    readonly tertiary: Palette<'HCT'>;
    readonly neutral: Palette<'HCT'>;
    readonly neutral_variant: Palette<'HCT'>;
    readonly error: Palette<'HCT'>;
};
declare function m3_scheme_tonal_spot(source_hue: number): SchemeTonalSpot;

declare function m3_role(scheme: SchemeTonalSpot, role: M3Role): Expr<Color<'HCT'>>;
declare function m3_role(scheme: SchemeTonalSpot, role: M3Role, mode: 'light' | 'dark'): Color<'HCT'>;

declare const STEVENS_AREA_EXPONENT = 0.7;
declare function stevens_area(perceived_ratio: number): number;
declare function stevens_general(perceived_ratio: number, exponent: number): number;

type LengthUnit = 'Px' | 'Cm' | 'Mm' | 'In' | 'Pt' | 'Pc' | 'Em' | 'Rem' | 'Ch' | 'Ex' | 'Vw' | 'Vh' | 'Vmin' | 'Vmax' | 'Cqi' | 'Cqb' | 'Cqw' | 'Cqh' | 'Pct' | 'Fr';
type Length<U extends LengthUnit> = {
    readonly magnitude: number;
    readonly unit: U;
} & {
    readonly __brand: 'Length';
};

declare function type_scale_step(n: number, base_param: string, ratio_param: string): Expr<Length<'Rem'>>;
declare function type_scale_fluid_step(n: number, base_min_param: string, base_max_param: string, ratio_min_param: string, ratio_max_param: string, vp_min_param: string, vp_max_param: string): Expr<Length<'Rem'>>;

type FluidCoefficients = {
    slope: number;
    intercept_px: number;
    slope_per_vw: number;
};
declare function fluid_coefficients(inner_min_px: number, inner_max_px: number, outer_min_px: number, outer_max_px: number): FluidCoefficients;

type Context = {
    readonly bindings: ReadonlyMap<string, Expr<unknown>>;
    readonly env: ReadonlyMap<string, unknown>;
    readonly parent?: Context;
};
declare const empty_ctx: Context;
declare function ctx_extend(ctx: Context, name: string, value: Expr<unknown>): Context;
declare function with_bindings(ctx: Context, entries: Readonly<Record<string, Expr<unknown>>>): Context;
declare function ctx_push(parent: Context, child: Context): Context;
declare function ctx_with_env(ctx: Context, key: string, value: unknown): Context;
declare function ctx_lookup(ctx: Context, name: string): Expr<unknown> | undefined;
declare function ctx_env_lookup(ctx: Context, query: ContextQuery): unknown | undefined;
declare function ctx_self_lookup(ctx: Context, name: string): Expr<unknown> | undefined;
declare function query_key(q: ContextQuery): string;

declare function root_context(): Context;

declare function lit_n(v: number): Expr<number>;
declare function lit_bool(v: boolean): Expr<boolean>;
declare function lit_ratio(v: number): Expr<number>;
declare function lit_hue(degrees: number): Expr<Hue>;
declare function lit_step(n: number): Expr<number>;
declare function lit_tag(domain: string, v: string): Expr<string>;
declare function lit_color<S extends ColorSpace>(coords: readonly [number, number, number], space: S): Expr<Color<S>>;
declare function make_param<T>(name: string, type: TypeRef, default_?: Expr<T>): Expr<T>;
declare function param_n(name: string, default_?: Expr<number>): Expr<number>;
declare function param_bool(name: string, default_?: Expr<boolean>): Expr<boolean>;
declare function param_color<S extends ColorSpace>(name: string, space: S, default_?: Expr<Color<S>>): Expr<Color<S>>;
declare function param_hue(name: string, default_?: Expr<Hue>): Expr<Hue>;
declare function make_op<T>(op: string, type: TypeRef, args: readonly Expr<unknown>[], opts?: Readonly<Record<string, Expr<unknown>>>): Expr<T>;
declare function if_<T>(cond: Expr<boolean>, then_: Expr<T>, else_: Expr<T>): Expr<T>;
declare function let_<T>(name: string, value: Expr<unknown>, body: Expr<T>): Expr<T>;
declare function let_many<T>(bindings: readonly {
    readonly name: string;
    readonly value: Expr<unknown>;
}[], body: Expr<T>): Expr<T>;
declare function lit_length<U extends LengthUnit>(n: number, unit: U): Expr<Length<U>>;
declare function param_length<U extends LengthUnit>(name: string, unit: U, default_?: Expr<Length<U>>): Expr<Length<U>>;
declare function seq_<T>(exprs: readonly Expr<unknown>[], result_type: TypeRef): Expr<T>;
declare function target_hint_<T>(target: string, hint: Readonly<Record<string, unknown>>, inner: Expr<T>): Expr<T>;
declare function comment_<T>(doc: string, inner: Expr<T>): Expr<T>;
declare function ctx_query_color_scheme(): Expr<string>;
declare function ctx_query_viewport(axis?: 'inline' | 'block' | 'width' | 'height'): Expr<Length<'Px'>>;
declare function ctx_query_container(axis?: 'inline' | 'block' | 'width' | 'height'): Expr<Length<'Px'>>;
declare function ctx_query_font_size(scope?: 'current' | 'root'): Expr<Length<'Px'>>;

declare const ErrorCode: {
    readonly UNBOUND_PARAM: "UNBOUND_PARAM";
    readonly CIRCULAR_REF: "CIRCULAR_REF";
    readonly MALFORMED_NODE: "MALFORMED_NODE";
    readonly DIVISION_BY_ZERO: "DIVISION_BY_ZERO";
    readonly INVALID_PARAM_TYPE: "INVALID_PARAM_TYPE";
    readonly INVARIANT_VIOLATION: "INVARIANT_VIOLATION";
    readonly TYPE_MISMATCH: "TYPE_MISMATCH";
    readonly INVALID_LITERAL: "INVALID_LITERAL";
    readonly STACK_OVERFLOW: "STACK_OVERFLOW";
    readonly GAMUT_EXHAUSTED: "GAMUT_EXHAUSTED";
    readonly UNKNOWN_OPERATOR: "UNKNOWN_OPERATOR";
    readonly CONVERGENCE_FAILED: "CONVERGENCE_FAILED";
    readonly UNKNOWN_M3_ROLE: "UNKNOWN_M3_ROLE";
    readonly UNSUPPORTED: "UNSUPPORTED";
    readonly MISSING_CTX_FOR_CONVERSION: "MISSING_CTX_FOR_CONVERSION";
    readonly INCOMPATIBLE_SPEC_VERSION: "INCOMPATIBLE_SPEC_VERSION";
    readonly PARAM_NOT_FOUND: "PARAM_NOT_FOUND";
};
type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
declare class CortexError extends Error {
    readonly code: ErrorCodeValue;
    readonly details?: unknown;
    constructor(code: ErrorCodeValue, message: string, details?: unknown);
}

type OpResolver = (op: string, args: readonly unknown[], opts: Readonly<Record<string, unknown>>, ctx: Context) => unknown;
declare function resolve<T>(expr: Expr<T>, ctx: Context, ops?: OpResolver, depth?: number): T;
declare function value_to_expr(val: unknown, type: TypeRef): Expr<unknown>;

interface Visitor<R> {
    visit_lit(node: LitNode<unknown>): R;
    visit_param(node: ParamNode<unknown>): R;
    visit_let(node: LetNode<unknown>): R;
    visit_op(node: OpNode<unknown>): R;
    visit_if(node: IfNode<unknown>): R;
    visit_seq(node: SeqNode<unknown>): R;
    visit_ctx_query(node: CtxQueryNode<unknown>): R;
    visit_target_hint?(node: TargetHintNode<unknown>): R;
    visit_comment?(node: CommentNode<unknown>): R;
    enter?(node: Expr<unknown>): void;
    exit?(node: Expr<unknown>, result: R): R;
}
declare function compose<R>(...visitors: Array<Visitor<R>>): Visitor<R>;
declare function walk<R>(node: Expr<unknown>, visitor: Visitor<R>): R;

declare function apca_contrast<S extends ColorSpace>(text: Color<S>, bg: Color<S>): number;

declare function color_l<S extends ColorSpace>(c: Color<S>): number;
declare function color_c<S extends ColorSpace>(c: Color<S>): number;
declare function color_h<S extends ColorSpace>(c: Color<S>): number;
declare function with_l<S extends ColorSpace>(c: Color<S>, l: number): Color<S>;
declare function with_c<S extends ColorSpace>(c: Color<S>, chroma: number): Color<S>;
declare function with_h<S extends ColorSpace>(c: Color<S>, h: number): Color<S>;

declare function color_from_hue<S extends ColorSpace>(hue: number, chroma: number, lightness: number, space: S): Color<S>;
declare function convert_space<S1 extends ColorSpace, S2 extends ColorSpace>(color: Color<S1>, target: S2): Color<S2>;

declare function ensure_contrast<S extends ColorSpace>(fg: Color<S>, bg: Color<S>, target: number): Color<S>;

type Triple = readonly [number, number, number];
declare function in_srgb_gamut(rgb: Triple, tol?: number): boolean;

declare function gamut_map_to_srgb(H: number, C: number, T: number): readonly [number, number, number];

declare function hue_shift(h: number, delta: number): number;
declare function hue_distance(h1: number, h2: number): number;

declare function relative_luminance<S extends ColorSpace>(c: Color<S>): number;

declare function mix_color<S extends ColorSpace>(a: Color<S>, b: Color<S>, t: number): Color<S>;

declare function lighten<S extends ColorSpace>(c: Color<S>, amount: number): Color<S>;
declare function darken<S extends ColorSpace>(c: Color<S>, amount: number): Color<S>;
declare function saturate<S extends ColorSpace>(c: Color<S>, amount: number): Color<S>;
declare function desaturate<S extends ColorSpace>(c: Color<S>, amount: number): Color<S>;
declare function shift_hue<S extends ColorSpace>(c: Color<S>, delta: number): Color<S>;
declare function complement<S extends ColorSpace>(c: Color<S>): Color<S>;

declare const DEFAULT_TONES: readonly [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
declare function tonal_palette(source_hue: number, source_chroma: number, opts?: {
    readonly tones?: readonly number[];
    readonly name?: string;
}): Palette<'HCT'>;
declare function palette_at<S extends ColorSpace>(palette: Palette<S>, tone: number, opts?: {
    readonly interpolate?: boolean;
}): Color<S>;

declare function wcag_contrast<S extends ColorSpace>(a: Color<S>, b: Color<S>): number;

type Ratio = number & {
    readonly __brand: 'Ratio';
};
declare function make_ratio(v: number): Ratio;
type Step = number & {
    readonly __brand: 'Step';
};
declare function make_step(n: number): Step;

declare function emit_css_color(expr: Expr<unknown>): string;

type CompatMode = 'baseline-2024' | 'baseline-2022' | 'baseline-2020';
type DarkModeStrategy = 'light-dark' | 'media-query' | 'class';
type FragmentPosition = 'head' | 'fallback-before' | 'body' | 'conditional' | 'footer';
type FragmentKind = 'custom-property' | 'css-comment' | 'at-rule' | 'value' | 'selector-block';
type NodePath = string;
interface CSSEmitFragment {
    readonly source_node_path: NodePath;
    readonly fragment_kind: FragmentKind;
    readonly content: string;
    readonly position: FragmentPosition;
    readonly dependencies?: readonly string[];
}
interface CSSEmitOptions {
    readonly compat?: CompatMode;
    readonly selector?: string;
    readonly inline_threshold?: number;
    readonly usage_map?: Map<string, number>;
    readonly dark_mode_strategy?: DarkModeStrategy;
    readonly themes?: Record<string, unknown>;
    readonly register_all_properties?: boolean;
    readonly fallback_policy?: 'strict' | 'lossy';
}
interface ValidationIssue {
    readonly severity: 'error' | 'warning';
    readonly code: string;
    readonly message: string;
    readonly node_path?: NodePath;
}
interface TargetCapabilities {
    readonly supported_node_kinds: readonly string[];
    readonly supported_operators: readonly string[];
    readonly supported_color_spaces: readonly string[];
    readonly features: {
        readonly custom_properties: boolean;
        readonly fluid_clamp: boolean;
        readonly container_queries: boolean;
        readonly reactive: boolean;
        readonly conditionals: boolean;
        readonly alpha?: boolean;
        readonly gradients?: boolean;
        readonly shadows?: boolean;
    };
}
interface Target<Output> {
    readonly name: string;
    readonly version: string;
    readonly cortex_spec_version: string;
    readonly capabilities: TargetCapabilities;
    readonly visit: Visitor<CSSEmitFragment | undefined>;
    format(fragments: readonly (CSSEmitFragment | undefined)[], opts?: CSSEmitOptions): Output;
    validate?(expr: Expr<unknown>, opts?: CSSEmitOptions): ValidationIssue[];
}

declare const CSS_TARGET_CAPABILITIES: TargetCapabilities;

declare function format_number(n: number, decimals?: number): string;
declare function composeCSS(fragments: readonly (CSSEmitFragment | undefined)[], opts?: CSSEmitOptions): string;

declare function is_container_if(node: Expr<unknown>): node is IfNode<unknown>;

declare function param_to_css_var(name: string): string;

declare function emit_css_length(expr: Expr<unknown>): string;

declare function is_color_scheme_if(node: Expr<unknown>): node is IfNode<unknown>;

declare function detect_color_scheme_ifs(expr: Expr<unknown>): boolean;

declare function dot_to_css_var(name: string): string;
declare function count_param_usage(expr: Expr<unknown>): Map<string, number>;
declare function build_root_block(declarations: readonly string[]): string;

declare function configure_emit(opts: Pick<CSSEmitOptions, 'dark_mode_strategy' | 'themes' | 'compat'>): void;
declare function reset_walk(): void;
declare function collected_fragments(): readonly CSSEmitFragment[];
declare const css_visitor: Visitor<CSSEmitFragment | undefined>;

declare function validate(expr: Expr<unknown>, opts?: CSSEmitOptions): ValidationIssue[];

declare const css_target: Target<string>;

declare function formula(expr: Expr<unknown>): string;
declare function formula_full(expr: Expr<unknown>): string;

type DependencyNode = {
    id: string;
    kind: Expr<unknown>['kind'];
    label: string;
    is_param: boolean;
    param_name?: string;
};
type DependencyEdge = {
    from: string;
    to: string;
    label?: string;
};
type DependencyGraph = {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
};
declare function graph(expr: Expr<unknown>): DependencyGraph;

interface Inspect {
    dependencies(expr: Expr<unknown>): string[];
    formula(expr: Expr<unknown>): string;
    formula_full(expr: Expr<unknown>): string;
    current_value<T>(expr: Expr<T>, ctx: Context): T;
    graph(expr: Expr<unknown>): DependencyGraph;
}
declare function dependencies(expr: Expr<unknown>): string[];
declare function current_value<T>(expr: Expr<T>, ctx: Context): T;
declare const inspect: Inspect;

declare function parse(json: string): Expr<unknown>;

declare function serialize(expr: Expr<unknown>): string;
declare function serializeModule(name: string, exprs: Record<string, Expr<unknown>>): string;

type Unsubscribe = () => void;

interface RuntimeInterface {
    evaluate<T>(expr: Expr<T>, ctx: Context): T;
    subscribe<T>(expr: Expr<T>, ctx: Context, cb: (v: T) => void): Unsubscribe;
    set_binding(ctx: Context, name: string, value: Expr<unknown>): void;
    flush(): void;
    on_recompute(expr: Expr<unknown>, cb: () => void): void;
}
declare const runtime: RuntimeInterface;

export { type Binding, COLOR_SPACES, type CSSEmitFragment, type CSSEmitOptions, CSS_TARGET_CAPABILITIES, type Color, type ColorSpace, type CommentNode, type CompatMode, type Context, type ContextQuery, CortexError, type CtxQueryNode, DEFAULT_TONES, type DarkModeStrategy, type DependencyEdge, type DependencyGraph, type DependencyNode, ErrorCode, type ErrorCodeValue, type Expr, type FluidCoefficients, type FragmentKind, type FragmentPosition, type Hue, type IfNode, type Inspect, type LetNode, type LitNode, type M3Role, M3_ROLES, type NodePath, type OpNode, type OpResolver, type Palette, type PaletteName, type ParamNode, type PrimitiveValue, type Ratio, type RoleDef, type RuntimeInterface, STEVENS_AREA_EXPONENT, type Scheme, type SchemeKind, type SchemeTonalSpot, type SeqNode, type SourceRef, type Step, type Target, type TargetCapabilities, type TargetHintNode, type TonePoint, type TonePointRaw, type TypeRef, type Unsubscribe, type ValidationIssue, type Visitor, apca_contrast, build_root_block, collected_fragments, color_c, color_from_hue, color_h, color_l, comment_, complement, compose, composeCSS, configure_emit, convert_space, count_param_usage, css_target, css_visitor, ctx_env_lookup, ctx_extend, ctx_lookup, ctx_push, ctx_query_color_scheme, ctx_query_container, ctx_query_font_size, ctx_query_viewport, ctx_self_lookup, ctx_with_env, current_value, darken, dependencies, desaturate, detect_color_scheme_ifs, dot_to_css_var, emit_css_color, emit_css_length, empty_ctx, ensure_contrast, fluid_coefficients, format_number, formula, formula_full, gamut_map_to_srgb, graph, harmonic_hues, hue_diff, hue_distance, hue_shift, if_, in_srgb_gamut, inspect, is_color_scheme_if, is_color_space, is_container_if, is_ctx_query, is_if, is_let, is_lit, is_op, is_param, let_, let_many, lighten, lit_bool, lit_color, lit_hue, lit_length, lit_n, lit_ratio, lit_step, lit_tag, lookup_role, m3_role, m3_scheme_tonal_spot, make_color, make_hue, make_op, make_param, make_ratio, make_step, mix_color as mix, palette_at, param_bool, param_color, param_hue, param_length, param_n, param_to_css_var, parse, query_key, relative_luminance, reset_walk, resolve, root_context, runtime, saturate, seq_, serialize, serializeModule, shift_hue, stevens_area, stevens_general, target_hint_, tonal_palette, type_ref_eq, type_scale_fluid_step, type_scale_step, validate, value_to_expr, walk, wcag_contrast, with_bindings, with_c, with_h, with_l };
