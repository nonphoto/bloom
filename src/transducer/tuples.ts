import {
  comp,
  multiplex,
  syncTuples,
  takeWhile,
  Transducer,
  TxLike,
} from "@thi.ng/transducers";

export function tuples<T, A, B>(
  a: TxLike<T, A>,
  b: TxLike<T, B>,
): Transducer<T, [A, B]>;
export function tuples<T, A, B, C>(
  a: TxLike<T, A>,
  b: TxLike<T, B>,
  c: TxLike<T, C>,
): Transducer<T, [A, B, C]>;
export function tuples(...args: any[]): any {
  return comp(
    multiplex(...(args as [TxLike<number, number>])),
    takeWhile((v) => v.some((x) => x != null)),
    syncTuples(args.length),
  );
}
