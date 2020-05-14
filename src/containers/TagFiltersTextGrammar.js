// Generated automatically by nearley, version undefined
// http://github.com/Hardmath123/nearley
export default {
  Lexer: undefined,
  ParserRules: [
    {"name": "Main", "symbols": ["Expr"]},
    {"name": "Main", "symbols": []},
    {"name": "Expr", "symbols": ["Or"]},
    {"name": "Expr", "symbols": ["And_"]},
    {"name": "Or", "symbols": ["Expr", "__", {"literal": "|", "pos": 28}, "__", "And_"]},
    {"name": "And_", "symbols": ["And"]},
    {"name": "And_", "symbols": ["Term_"]},
    {"name": "And", "symbols": ["And_", "__", {"literal": "&", "pos": 52}, "__", "Term_"]},
    {"name": "Term_", "symbols": ["Not"]},
    {"name": "Term_", "symbols": ["Expr_"]},
    {"name": "Term_", "symbols": ["Term"]},
    {"name": "Not", "symbols": [{"literal": "!", "pos": 76}, "Expr_"]},
    {"name": "Expr_", "symbols": [{"literal": "(", "pos": 84}, "_", "Expr", "_", {"literal": ")", "pos": 92}]},
    {
      "name": "Term$string$1", "symbols": [{"literal": "#"}, {"literal": "{"}], "postprocess": function joiner(d) {
        return d.join('');
      }
    },
    {"name": "Term", "symbols": ["Term$string$1", "n", {"literal": "}", "pos": 102}]},
    {"name": "n$ebnf$1", "symbols": [/[^{}]/]},
    {
      "name": "n$ebnf$1", "symbols": [/[^{}]/, "n$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {"name": "n", "symbols": ["n$ebnf$1"]},
    {"name": "__$ebnf$1", "symbols": [{"literal": " ", "pos": 115}]},
    {
      "name": "__$ebnf$1",
      "symbols": [{"literal": " ", "pos": 115}, "__$ebnf$1"],
      "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "_$ebnf$1", "symbols": []},
    {
      "name": "_$ebnf$1", "symbols": [{"literal": " ", "pos": 122}, "_$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {"name": "_", "symbols": ["_$ebnf$1"]}
  ]
  , ParserStart: "Main"
};
