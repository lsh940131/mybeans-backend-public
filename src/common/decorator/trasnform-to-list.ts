import { Transform } from 'class-transformer';

export function TransformToList(sep: RegExp | string = /[,\s]+/) {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return [];

    const stack: unknown[] = Array.isArray(value) ? [...value] : [value];
    const out: (number | string)[] = [];

    while (stack.length) {
      const cur = stack.pop();

      if (cur === undefined || cur === null || cur === '') continue;

      if (Array.isArray(cur)) {
        stack.push(...cur);
        continue;
      }

      if (typeof cur === 'number') {
        if (Number.isFinite(cur)) out.push(cur);
        continue;
      }

      if (typeof cur === 'string') {
        const s = cur.trim();
        if (!s) continue;

        // JSON 배열 문자열 지원
        if (s.startsWith('[') && s.endsWith(']')) {
          try {
            const parsed = JSON.parse(s);
            stack.push(parsed);
            continue;
          } catch {
            // 실패 시 아래 split 경로
          }
        }

        const normalized = s.replace(/[,;|]/g, ',');

        for (const token of normalized.split(sep)) {
          const t = token.trim();
          if (!t) continue;

          const num = Number(t);
          if (Number.isFinite(num)) {
            out.push(num);
          } else {
            out.push(t); // 숫자로 안 되면 문자열로라도 보존
          }
        }
        continue;
      }
    }

    return [...new Set(out)];
  });
}
