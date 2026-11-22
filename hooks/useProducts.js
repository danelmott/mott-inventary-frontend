'use client';
import { useCommerce } from '@/contexts/CommerceContext';
import { useToast } from '@/contexts/ToastContext';
import { useApiData } from '@/hooks/useApiData';
import { createProduct, deleteProduct, getProducts, updateProduct } from '@/lib/api/products';

// Los productos del comercio, del backend. Guardar y borrar van a la API y, si salen bien, cambian la lista sin pedirla de nuevo.
export function useProducts() {
    const { commerce } = useCommerce();
    const toast = useToast();
    const { data: products, loading, setData } = useApiData(`products:${commerce.id}`, () => getProducts(commerce.id));

    // Handlers
    // uno nuevo va primero; uno que ya estaba se reemplaza en su lugar. Si falla lanza el Error (el formulario lo muestra)
    const saveProduct = async (id, data) => {
        const saved = id ? await updateProduct(commerce.id, id, data) : await createProduct(commerce.id, data);
        setData((current) => (current?.some((item) => item.id === saved.id)
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [saved, ...(current ?? [])]));
        return saved;
    };

    const removeProduct = async (product) => {
        try {
            await deleteProduct(commerce.id, product.id);
            setData((current) => current?.filter((item) => item.id !== product.id));
            toast.success('Producto eliminado');
        } catch (error) {
            toast.danger(error.message);
        }
    };

    return { products, loading, saveProduct, deleteProduct: removeProduct };
}
