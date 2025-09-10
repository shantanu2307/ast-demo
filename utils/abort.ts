export default function abort(err: string | Error) {
  console.error(err);
  process.exit(1);
}
