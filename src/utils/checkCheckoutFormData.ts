import toast from "react-hot-toast";

export const checkCheckoutFormData = (checkoutData: {
  data: {
    [k: string]: FormDataEntryValue;
  };
  products: ProductInCart[];
  subtotal: number;
}) => {
  if (!checkoutData.data?.address?.toString().trim()) {
    toast.error("Address is required");
    return false;
  } else if (!checkoutData.data?.city?.toString().trim()) {
    toast.error("City is required");
    return false;
  } else if (!checkoutData.data?.country?.toString().trim()) {
    toast.error("Country is required");
    return false;
  } else if (!checkoutData.data?.emailAddress?.toString().trim()) {
    toast.error("Email address is required");
    return false;
  } else if (!checkoutData.data?.firstName?.toString().trim()) {
    toast.error("First name is required");
    return false;
  } else if (!checkoutData.data?.lastName?.toString().trim()) {
    toast.error("Last name is required");
    return false;
  } else if (!checkoutData.data?.phone?.toString().trim()) {
    toast.error("Phone is required");
    return false;
  } else if (!checkoutData.data?.postalCode?.toString().trim()) {
    toast.error("Postal code is required");
    return false;
  } else if (!checkoutData.data?.region?.toString().trim()) {
    toast.error("Region is required");
    return false;
  } else if (checkoutData?.products.length === 0) {
    toast.error("Products are required");
    return false;
  } else if (checkoutData?.subtotal === 0) {
    toast.error("Subtotal is required");
    return false;
  }

  return true;
};
