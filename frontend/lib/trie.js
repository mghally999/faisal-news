class TrieNode {
  constructor() {
    this.children = new Map();
    this.end = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    if (typeof word !== 'string' || !word.trim()) return;
    const w = word.trim().toLowerCase();
    let node = this.root;
    for (const ch of w) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.end = true;
  }

  wordsWithPrefix(prefix, limit = 8) {
    if (typeof prefix !== 'string' || !prefix) return [];
    const p = prefix.toLowerCase();
    let node = this.root;
    for (const ch of p) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch);
    }
    const results = [];
    const stack = [{ node, prefix: p }];
    while (stack.length && results.length < limit) {
      const { node: n, prefix: pre } = stack.pop();
      if (n.end) results.push(pre);
      const entries = Array.from(n.children.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      for (let i = entries.length - 1; i >= 0; i--) {
        stack.push({ node: entries[i][1], prefix: pre + entries[i][0] });
      }
    }
    return results;
  }
}

export default Trie;
