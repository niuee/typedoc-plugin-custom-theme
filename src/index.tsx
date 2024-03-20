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
          if(summary.kind === "text"){
            descriptions.push(summary.text);
          }
        });
      }
      return (
        <>
        <ul
            class={"tsd-signatures " + this.getReflectionClasses(props)}
        >
            {descriptions.map((description)=>{
              return (
                <p>{description}</p>
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
    app.renderer.defineTheme("my-theme", MyTheme);
    
  }