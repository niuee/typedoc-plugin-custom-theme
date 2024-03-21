import {
    Application,
    JSX,
    DefaultTheme,
    PageEvent,
    Reflection,
    DefaultThemeRenderContext,
    Options,
    RenderTemplate,
    DeclarationReflection,
    ReflectionKind,
    ParameterReflection,
    SignatureReflection,
    ReferenceReflection,
    ProjectReflection
  } from "typedoc";
  // import { Raw } from "typedoc/dist/lib/utils";
  /**
   * A clone of the default theme, which prints a message when rendering each page.
   */
  export class LoggingTheme extends DefaultTheme {
    render(page: PageEvent<Reflection>, template: RenderTemplate<PageEvent<Reflection>>): string {
      this.application.logger.info(`Rendering ${page.url}`);
      return super.render(page, template);
    }
  }
  
  class MyThemeContext extends DefaultThemeRenderContext {
    // Important: If you use `this`, this function MUST be bound! Template functions are free
    // to destructure the context object to only grab what they care about.
    override memberGetterSetter = (props: DeclarationReflection) => {
      const descriptions:string[] = [];
      if(props.comment && props.kind === 262144){
        props.comment.summary.forEach((summary)=>{
          descriptions.push(summary.text);
        });
      }
      return (
        <>
        <ul
            class={"tsd-signatures " + this.getReflectionClasses(props)}
        >
            {descriptions.map((description)=>{
              return (
                <JSX.Raw html={this.markdown(description)}/>
              )
            })}
            {!!props.getSignature && (
                <>
                    <li class="tsd-signature" id={props.getSignature.anchor}>
                        <span class="tsd-signature-keyword">get</span> {props.name}
                        {this.memberSignatureTitle(props.getSignature, {
                            hideName: true,
                        })}
                    </li>
                    <li class="tsd-description">{this.memberSignatureBody(props.getSignature)}</li>
                </>
            )}
            {!!props.setSignature && (
                <>
                    <li class="tsd-signature" id={props.setSignature.anchor}>
                        <span class="tsd-signature-keyword">set</span> {props.name}
                        {this.memberSignatureTitle(props.setSignature, {
                            hideName: true,
                        })}
                    </li>
                    <li class="tsd-description">{this.memberSignatureBody(props.setSignature)}</li>
                </>
            )}
        </ul>
    </>
      );
    }

    override commentTags = (props: Reflection)=> {
      if (!props.comment) return;
  
      const tags = props.kindOf(ReflectionKind.SomeSignature)
          ? props.comment.blockTags.filter((tag) => tag.tag !== "@returns")
          : props.comment.blockTags;
  
      return (
          <div class="tsd-comment tsd-typography">
              {tags.map((item) => {
                  const name = item.name
                      ? `${camelToTitleCase(item.tag.substring(1))}: ${item.name}`
                      : camelToTitleCase(item.tag.substring(1));
  
                  return (
                      <>
                          {name !== "Translation Block" && <h4>{name}</h4>}
                          <JSX.Raw html={this.markdown(item.content)} />
                      </>
                  );
              })}
          </div>
      );
  }

  override member = (props: DeclarationReflection) => {
    this.page.pageHeadings.push({
        link: `#${props.anchor}`,
        text: getDisplayName(props),
        kind: props.kind,
        classes: this.getReflectionClasses(props),
    });
    const read = props.getSignature !== undefined;
    const write = props.setSignature !== undefined;
    const l10nCode = this.options.getValue("l10nCode") as string;
    return (
        <section class={classNames({ "tsd-panel": true, "tsd-member": true }, this.getReflectionClasses(props))}>
            <a id={props.anchor} class="tsd-anchor"></a>
            {!!props.name && (
                <>
                  <h3 class="tsd-anchor-link">
                      {(read || write) && <span style="font-size: 12px; border-radius: 5px; border: 1px solid; font-weight: normal; margin-right: 5px; padding: 5px">{read && write ? "read and write" : read ? "read only" : "write only"}</span>}
                      {this.reflectionFlags(props)}
                      <span class={classNames({ deprecated: props.isDeprecated() })}>{wbr(props.name)}</span>
                      {anchorIcon(this, props.anchor)}
                  </h3>
                </>
            )}
            {props.signatures
                ? this.memberSignatures(props)
                : props.hasGetterOrSetter()
                ? this.memberGetterSetter(props)
                : props instanceof ReferenceReflection
                ? this.memberReference(props)
                : this.memberDeclaration(props)}

            {props.groups?.map((item) => item.children.map((item) => !item.hasOwnDocument && this.member(item)))}
        </section>
    );
  }

}

export function classNames(names: Record<string, boolean | null | undefined>, extraCss?: string) {
  const css = Object.keys(names)
      .filter((key) => names[key])
      .concat(extraCss || "")
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
  return css.length ? css : undefined;
}

export function getDisplayName(refl: Reflection): string {
  let version = "";
  if ((refl instanceof DeclarationReflection || refl instanceof ProjectReflection) && refl.packageVersion) {
      version = ` - v${refl.packageVersion}`;
  }

  return `${refl.name}${version}`;
}

export function wbr(str: string): (string | JSX.Element)[] {
  // TODO surely there is a better way to do this, but I'm tired.
  const ret: (string | JSX.Element)[] = [];
  const re = /[\s\S]*?(?:[^_-][_-](?=[^_-])|[^A-Z](?=[A-Z][^A-Z]))/g;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(str))) {
      ret.push(match[0], <wbr />);
      i += match[0].length;
  }
  ret.push(str.slice(i));

  return ret;
}

export function anchorIcon(context: DefaultThemeRenderContext, anchor: string | undefined) {
  if (!anchor) return <></>;

  return (
      <a href={`#${anchor}`} aria-label="Permalink" class="tsd-anchor-icon">
          {context.icons.anchor()}
      </a>
  );
}

class MyTheme extends DefaultTheme {
    getRenderContext(pageEvent: PageEvent<Reflection>): DefaultThemeRenderContext {
        return new MyThemeContext(this, pageEvent, this.application.options);
    }
}
  /**
   * Called by TypeDoc when loading this theme as a plugin. Should be used to define themes which
   * can be selected by the user.
   */
  export function load(app: Application) {
    // Hooks can be used to inject some HTML without fully overwriting the theme.
    app.renderer.hooks.on("body.begin", (_) => (
      <script>
        <JSX.Raw html="console.log(`Loaded ${location.href}`)" />
      </script>
    ));
  
    // Or you can define a custom theme. This one behaves exactly like the default theme,
    // but logs a message when rendering a page.
    app.renderer.defineTheme("logging", LoggingTheme);
    app.renderer.defineTheme("translation-theme", MyTheme);
    
  }

  export function camelToTitleCase(text: string) {
    return text.substring(0, 1).toUpperCase() + text.substring(1).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`);
}