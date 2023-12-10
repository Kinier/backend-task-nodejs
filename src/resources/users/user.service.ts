import { AppDataSource } from "../../data-source";
import { User } from "./user.entity";
import { DeleteResult, UpdateResult } from "typeorm";
const userRepository = AppDataSource.getRepository(User)


const getAll = async (): Promise<User[] | null> => {
    return userRepository.find();
    
};

const getById = async (id: number): Promise<User | null> => {
    return userRepository.findOneBy({id})
    
};

const getByEmail = async (email: string): Promise<User | null> => {
    return userRepository.findOneBy({email})
    
};

const checkUser = async (email: string, password: string): Promise<User | null> => {
    return userRepository.findOneBy({email, password})
    
};

const createUser = async ({ email, firstName, lastName, password }: Omit<User, 'id'|'pdf'|'image'>): Promise<User> => {
    const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = password
        return userRepository.save(user);
    
};


const deleteById = async (id: number): Promise<DeleteResult> => {
    return userRepository.delete({id: id});
};


const updateById = async (id: number, user: Omit<User, 'id'>): Promise<UpdateResult> => {
    return userRepository.update({id}, user);
     
};

const updateImageById = async (id: number, image: string): Promise<UpdateResult> => {
    const user = new User();
    user.image = image;
    return userRepository.update({id}, user);
     
};



const updateDocByEmail = async (email: string, doc: Buffer): Promise<UpdateResult> => {
    const user = new User();
    user.pdf = doc;
    return userRepository.update({email}, user);
     
};


export const userService = {
    getById, createUser, deleteById, updateById, updateImageById, updateDocByEmail, getByEmail, checkUser, getAll
}