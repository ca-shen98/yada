import nearley from 'nearley'
// Generated automatically by nearley, version undefined
// http://github.com/Hardmath123/nearley
/*
Main -> Expression {% id %}
Expression -> Expression_ {% id %} | Factor {% id %}
Expression_ -> Factor _ "|" _ Expression {% function(d) { return [d[0], d[2], d[4]] } %}
Factor -> Factor_ {% id %} | Term {% id %}
Factor_ -> Term _ "&" _ Factor {% function(d) { return [d[0], d[2], d[4]] } %}
Term -> Not {% id %} | Nested {% id %} | Tag {% id %}
Not -> "!" (Nested {% id %} | Tag {% id %})
Nested -> "(" _ Expression _ ")" {% function(d) { return d[2] } %}
Tag -> "#{" [^{}]:+ "}" {% function(d) { return [d[0], d[1].join(""), d[2]].join("") } %}
_ -> " ":* {% function(d) { return null } %}
*/
function id(x) { return x[0]; }
export const Grammar = ({
  Lexer: undefined,
  ParserRules: [
    {"name": "Main", "symbols": ["Expression"], "postprocess": id},
    {"name": "Expression", "symbols": ["Expression_"], "postprocess": id},
    {"name": "Expression", "symbols": ["Factor"], "postprocess": id},
    {"name": "Expression_", "symbols": ["Factor", "_", {"literal":"|","pos":30}, "_", "Expression"], "postprocess": function(d) { return [d[0], d[2], d[4]] }},
    {"name": "Factor", "symbols": ["Factor_"], "postprocess": id},
    {"name": "Factor", "symbols": ["Term"], "postprocess": id},
    {"name": "Factor_", "symbols": ["Term", "_", {"literal":"&","pos":60}, "_", "Factor"], "postprocess": function(d) { return [d[0], d[2], d[4]] }},
    {"name": "Term", "symbols": ["Not"], "postprocess": id},
    {"name": "Term", "symbols": ["Nested"], "postprocess": id},
    {"name": "Term", "symbols": ["Tag"], "postprocess": id},
    {"name": "Not$subexpression$1", "symbols": ["Nested"], "postprocess": id},
    {"name": "Not$subexpression$1", "symbols": ["Tag"], "postprocess": id},
    {"name": "Not", "symbols": [{"literal":"!","pos":92}, "Not$subexpression$1"]},
    {"name": "Nested", "symbols": [{"literal":"(","pos":110}, "_", "Expression", "_", {"literal":")","pos":118}], "postprocess": function(d) { return d[2] }},
    {"name": "Tag$string$1", "symbols": [{"literal":"#"}, {"literal":"{"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Tag$ebnf$1", "symbols": [/[^{}]/]},
    {"name": "Tag$ebnf$1", "symbols": [/[^{}]/, "Tag$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Tag", "symbols": ["Tag$string$1", "Tag$ebnf$1", {"literal":"}","pos":131}], "postprocess": function(d) { return [d[0], d[1].join(""), d[2]].join("") }},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": [{"literal":" ","pos":139}, "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) { return null }}
  ]
  , ParserStart: "Main"
});
export const parse = (inputText, throwErrors = true) => {
  let outputParsedExpr = null;
  if (inputText) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));
    try {
      parser.feed(inputText.trim());
      if (parser.results.length > 0) {
        outputParsedExpr = parser.results;
      } else {
        // TODO (incomplete)
      }
    } catch(ex) {
      // TODO (invalid)
    }
  }
  return outputParsedExpr;
};

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';
export const initialTagFiltersText = localStorage.getItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY) || '';
export const initialTagFiltersExpr = parse(initialTagFiltersText);
