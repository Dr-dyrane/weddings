# ADR 0001: Server-first invitation with a presentation island

Status: accepted

## Decision

Wedding and invitation data resolve in Server Components. The route renders all essential content as semantic HTML and passes a serializable invite-safe projection to a lazy client presentation island. Canvas is decorative and owns no data, navigation, access, or RSVP truth.

## Consequences

The invitation remains useful before JavaScript or WebGL loads and can be indexed safely on the generic route. Spatial code can evolve or fail independently. Any fact shown only inside Canvas is a release blocker.
