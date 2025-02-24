import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userRole: "admin" | "user" | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  register: (email: string, password: string) => Promise<void>; // ✅ Tambahkan register
  signIn: (email: string, password: string) => Promise<void>; // ✅ Tambahkan signIn
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserRole(userSnap.data().isAdmin ? "admin" : "user");
        } else {
          setUserRole("user");
        }

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fungsi Register
  async function register(email: string, password: string) {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Simpan data user ke Firestore (default sebagai "user")
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        isAdmin: false, // Default semua user baru adalah "user"
        createdAt: new Date().toISOString(),
      });

      setUserRole("user");
      setCurrentUser(user);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fungsi Login
  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      setUserRole(
        userSnap.exists() && userSnap.data().isAdmin ? "admin" : "user"
      );

      setCurrentUser(user);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fungsi Logout
  async function signOut() {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        loading,
        setLoading,
        register,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
