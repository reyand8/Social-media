import {Observable} from 'rxjs';


interface IWithImage<T> {
  image?: T;
}

export function processImage<T extends IWithImage<K>, K>(
  profilePhoto: File,
  jsonPayload: T,
  sendRequest: (payload: T) => Observable<any>
): Observable<any> {
  return new Observable<any>((observer) => {
    const reader: FileReader = new FileReader();
    reader.onload = (): void => {
      jsonPayload.image = reader.result as K;
      sendRequest(jsonPayload).subscribe({
        next: (val) => {
          observer.next(val);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    };
    reader.onerror = (err) => observer.error(err);
    reader.readAsDataURL(profilePhoto);
  });
}
