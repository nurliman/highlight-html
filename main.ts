import { highlightHtml } from "./highlightHtml.ts";

const html = `
    <div>
        lorem <span>ipsum <span>dol</span>or</span> sit amet
        <br />
        lorem <span>ipsum dolor</span> sit amet
    </div>
`;

if (import.meta.main) {
  console.log(highlightHtml(html, "dolor"));
}
