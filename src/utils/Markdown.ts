// @ts-ignore
import MarkdownIt from "markdown-it";

const parserMarkdown = new MarkdownIt({
  html: false, // desactivamos el uso de HTML dentro del markdown
  breaks: true, // transforma los saltos de línea a un <br />
  linkify: true, // detecta enlaces y los vuelve enlaces
  xhtmlOut: true, // devuelve XHTML válido (por ejemplo <br /> en vez de <br>)
  typographer: true, // reemplaza ciertas palabras para mejorar el texto
  langPrefix: "language-" // agrega una clase `language-[lang]` a los bloques de código
});

export default parserMarkdown