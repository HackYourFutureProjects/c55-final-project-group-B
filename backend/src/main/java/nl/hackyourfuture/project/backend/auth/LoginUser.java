package nl.hackyourfuture.project.backend.auth;

import java.util.UUID;

public record LoginUser(UUID id, String name, String email, String passwordHash) {
    @Override
    public String toString() {
        return "LoginUser[id=" + id + "]";
    }
}
