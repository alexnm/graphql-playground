export const compose = ( ...fns ) => ( value ) =>
    fns.reverse().reduce( ( acc, fn ) => fn( acc ), value );
