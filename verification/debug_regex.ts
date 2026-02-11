const code = "10W";
const c = code.trim().toUpperCase();
const match = c.match(/^(\d+)\s*W(-P|-PO)?$/);
console.log("10W Match:", match);

const code2 = "10 W";
const c2 = code2.trim().toUpperCase();
const match2 = c2.match(/^(\d+)\s*W(-P|-PO)?$/);
console.log("10 W Match:", match2);
