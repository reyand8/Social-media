import {Observable} from 'rxjs';


interface IWithImage<T> {
  image?: T;
}

/**
 * Processes an image file and adds it to the given payload before sending a request.
 * @param profilePhoto - The image file to be processed.
 * @param jsonPayload - The payload object that may contain an image property.
 * @param sendRequest - A function that sends the payload in an HTTP request.
 * @returns An Observable that emits the response from the sendRequest function.
 */
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
        next: (val): void => {
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
